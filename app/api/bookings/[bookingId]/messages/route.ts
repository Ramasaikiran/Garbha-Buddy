import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
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
  const { senderId, body } = await request.json();
  if (!senderId || !body?.trim()) {
    return NextResponse.json({ error: 'senderId and body required' }, { status: 400 });
  }

  const booking = await db.query('SELECT status FROM bookings WHERE id = $1', [params.bookingId]);
  if (!booking.rows[0] || !['active', 'completed'].includes(booking.rows[0].status)) {
    return NextResponse.json(
      { error: 'Chat opens only after payment is confirmed' },
      { status: 400 }
    );
  }

  await db.query(
    `INSERT INTO booking_messages (booking_id, sender_id, body) VALUES ($1, $2, $3)`,
    [params.bookingId, senderId, body.trim()]
  );

  return NextResponse.json({ success: true });
}
