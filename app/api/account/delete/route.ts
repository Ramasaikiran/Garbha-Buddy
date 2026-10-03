import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { getSupabaseAdmin } from '@/lib/supabase';

// Account deletion, done as anonymization rather than a hard row delete.
// bookings.client_id / bookings.companion_id reference users(id) with no
// ON DELETE CASCADE, so a hard delete throws a foreign-key error for
// anyone with booking history — and even where it wouldn't, our own
// privacy policy commits to keeping booking/financial records for
// dispute and legal-retention purposes. So this clears identity fields
// on the users row (name, phone, email, Aadhaar images, selfie) and
// removes the companion's public profile, while leaving the booking
// rows themselves intact for the other party's records and any
// legal/financial retention need.
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const blocking = await db.query(
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
    [session.userId]
  );
  const flags = blocking.rows[0];

  if (flags.has_open_booking) {
    return NextResponse.json(
      { error: 'You have a booking in progress. Cancel or complete it before deleting your account.' },
      { status: 409 }
    );
  }
  if (flags.has_pending_payout) {
    return NextResponse.json(
      { error: "You have a payout that hasn't been paid out yet. Please wait for it to process, or contact support." },
      { status: 409 }
    );
  }
  if (flags.has_failed_refund) {
    return NextResponse.json(
      { error: 'A refund or payout on one of your bookings needs manual resolution first. Contact support.' },
      { status: 409 }
    );
  }
  if (flags.has_pending_penalty) {
    return NextResponse.json(
      { error: 'You have an outstanding penalty balance. Contact support before deleting your account.' },
      { status: 409 }
    );
  }

  const userRow = await db.query(`SELECT auth_user_id FROM users WHERE id = $1`, [session.userId]);
  const authUserId = userRow.rows[0]?.auth_user_id;

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    if (session.role === 'companion') {
      await client.query(`DELETE FROM companions_meta WHERE id = $1`, [session.userId]);
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
      [session.userId]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('account delete: failed to anonymize user row', err);
    return NextResponse.json({ error: 'Could not delete your account. Try again.' }, { status: 500 });
  } finally {
    client.release();
  }

  if (authUserId) {
    try {
      await getSupabaseAdmin().auth.admin.deleteUser(authUserId);
    } catch (err) {
      // Data is already scrubbed at this point, which is the part that
      // matters most; log so the orphaned auth user can be cleaned up
      // manually rather than failing the whole request.
      console.error('account delete: failed to delete Supabase auth user', authUserId, err);
    }
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set('session', '', { httpOnly: true, maxAge: 0, path: '/' });
  return res;
}
