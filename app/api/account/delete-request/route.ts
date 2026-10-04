import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { getBlockingReason, BLOCK_MESSAGES } from '@/lib/account-deletion';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const result = await db.query(
    `SELECT id, status, requested_at, admin_note
     FROM account_deletion_requests
     WHERE user_id = $1
     ORDER BY requested_at DESC
     LIMIT 1`,
    [session.userId]
  );

  return NextResponse.json({ request: result.rows[0] || null });
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const reason = await getBlockingReason(session.userId);
  if (reason) {
    return NextResponse.json({ error: BLOCK_MESSAGES[reason] }, { status: 409 });
  }

  try {
    await db.query(
      `INSERT INTO account_deletion_requests (user_id, role)
       VALUES ($1, $2)`,
      [session.userId, session.role]
    );
  } catch (err: any) {
    // Unique partial index on (user_id) WHERE status = 'pending'
    if (err?.code === '23505') {
      return NextResponse.json({ error: 'You already have a pending deletion request.' }, { status: 409 });
    }
    console.error('delete-request: failed to insert request', err);
    return NextResponse.json({ error: 'Could not submit your request. Try again.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  await db.query(
    `DELETE FROM account_deletion_requests WHERE user_id = $1 AND status = 'pending'`,
    [session.userId]
  );

  return NextResponse.json({ success: true });
}
