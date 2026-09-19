import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

async function assertMember(bookingId: string, userId: string) {
  const booking = await db.query(
    'SELECT client_id, companion_id, status FROM bookings WHERE id = $1',
    [bookingId]
  );
  const row = booking.rows[0];
  if (!row) return { ok: false, status: 404, error: 'Booking not found' } as const;
  if (row.client_id !== userId && row.companion_id !== userId) {
    return { ok: false, status: 403, error: 'Not authorized for this booking' } as const;
  }
  return { ok: true, status: row.status } as const;
}

export async function GET(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const check = await assertMember(params.bookingId, session.userId);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const result = await db.query(
    `SELECT sender_id, body, created_at FROM booking_messages
     WHERE booking_id = $1 ORDER BY created_at ASC`,
    [params.bookingId]
  );
  return NextResponse.json({ messages: result.rows });
}

export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { body } = await request.json();
  if (!body?.trim()) {
    return NextResponse.json({ error: 'body required' }, { status: 400 });
  }

  const check = await assertMember(params.bookingId, session.userId);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }
  if (!['active', 'completed'].includes(check.status)) {
    return NextResponse.json(
      { error: 'Chat opens only after payment is confirmed' },
      { status: 400 }
    );
  }

  // sender is always the authenticated session user — never trust a client-supplied id
  await db.query(
    `INSERT INTO booking_messages (booking_id, sender_id, body) VALUES ($1, $2, $3)`,
    [params.bookingId, session.userId, body.trim()]
  );

  return NextResponse.json({ success: true });
}
