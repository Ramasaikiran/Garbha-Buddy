import { db } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';

export type BlockReason =
  | 'open_booking'
  | 'pending_payout'
  | 'failed_refund'
  | 'pending_penalty';

export const BLOCK_MESSAGES: Record<BlockReason, string> = {
  open_booking: 'This account has a booking in progress. It must be cancelled or completed first.',
  pending_payout: "This account has a payout that hasn't been paid out yet.",
  failed_refund: 'A refund or payout on one of this account\u2019s bookings needs manual resolution first.',
  pending_penalty: 'This account has an outstanding penalty balance.',
};

// Same financial-safety checks for both the user's request and the
// admin's approval (state can change between the two, e.g. a new
// booking made after the request was submitted).
export async function getBlockingReason(userId: string): Promise<BlockReason | null> {
  const result = await db.query(
    `SELECT
       EXISTS (
         SELECT 1 FROM bookings
         WHERE (client_id = $1 OR companion_id = $1)
           AND status IN ('pending', 'active')
       ) AS has_open_booking,
       EXISTS (
         SELECT 1 FROM bookings
         WHERE companion_id = $1 AND status = 'completed' AND payout_status = 'escrow'
       ) AS has_pending_payout,
       EXISTS (
         SELECT 1 FROM bookings
         WHERE (client_id = $1 OR companion_id = $1) AND payout_status = 'failed'
       ) AS has_failed_refund,
       EXISTS (
         SELECT 1 FROM companion_penalties
         WHERE companion_id = $1 AND status = 'pending'
       ) AS has_pending_penalty`,
    [userId]
  );
  const flags = result.rows[0];
  if (flags.has_open_booking) return 'open_booking';
  if (flags.has_pending_payout) return 'pending_payout';
  if (flags.has_failed_refund) return 'failed_refund';
  if (flags.has_pending_penalty) return 'pending_penalty';
  return null;
}

// Anonymizes rather than hard-deletes: bookings.client_id/companion_id
// reference users(id) with no ON DELETE CASCADE, and the privacy policy
// commits to keeping booking/financial records for dispute and legal
// retention. Clears identity fields, revokes Supabase login, and (for
// companions) removes the public profile. Caller must have already
// confirmed getBlockingReason() returned null.
export async function anonymizeUser(userId: string, role: string): Promise<void> {
  const userRow = await db.query(`SELECT auth_user_id FROM users WHERE id = $1`, [userId]);
  const authUserId = userRow.rows[0]?.auth_user_id;

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    if (role === 'companion') {
      await client.query(`DELETE FROM companions_meta WHERE id = $1`, [userId]);
    }
    await client.query(
      `UPDATE users
       SET name = 'Deleted user',
           phone_number = NULL,
           email = NULL,
           aadhaar_front_url = NULL,
           aadhaar_back_url = NULL,
           aadhaar_last4 = NULL,
           selfie_url = NULL,
           auth_user_id = NULL
       WHERE id = $1`,
      [userId]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  if (authUserId) {
    try {
      await getSupabaseAdmin().auth.admin.deleteUser(authUserId);
    } catch (err) {
      // Data is already scrubbed, which is the part that matters most;
      // log so the orphaned auth user can be cleaned up manually rather
      // than failing the whole request.
      console.error('anonymizeUser: failed to delete Supabase auth user', authUserId, err);
    }
  }
}
