import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin-session';
import { getBlockingReason, BLOCK_MESSAGES, anonymizeUser } from '@/lib/account-deletion';

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await db.query(
    `SELECT r.id, r.user_id, r.role, r.status, r.requested_at,
            u.name, u.email, u.phone_number
     FROM account_deletion_requests r
     JOIN users u ON u.id = r.user_id
     WHERE r.status = 'pending'
     ORDER BY r.requested_at ASC`
  );

  return NextResponse.json({ requests: result.rows });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { requestId, approve, note } = await request.json();

  const reqRow = await db.query(
    `SELECT id, user_id, role FROM account_deletion_requests WHERE id = $1 AND status = 'pending'`,
    [requestId]
  );
  if (reqRow.rows.length === 0) {
    return NextResponse.json({ error: 'Request not found or already resolved.' }, { status: 404 });
  }
  const { user_id: userId, role } = reqRow.rows[0];

  if (approve) {
    // Re-check: account state can have changed since the request was
    // submitted (e.g. a new booking made in the meantime).
    const reason = await getBlockingReason(userId);
    if (reason) {
      return NextResponse.json(
        { error: `Can't approve yet: ${BLOCK_MESSAGES[reason]}` },
        { status: 409 }
      );
    }

    try {
      await anonymizeUser(userId, role);
    } catch (err) {
      console.error('deletion-requests: failed to anonymize user', userId, err);
      return NextResponse.json({ error: 'Could not delete the account. Try again.' }, { status: 500 });
    }
  }

  await db.query(
    `UPDATE account_deletion_requests
     SET status = $1, resolved_at = CURRENT_TIMESTAMP, admin_note = $2
     WHERE id = $3`,
    [approve ? 'approved' : 'rejected', note || null, requestId]
  );

  return NextResponse.json({ success: true });
}
