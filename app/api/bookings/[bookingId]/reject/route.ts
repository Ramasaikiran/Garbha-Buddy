import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  const { note } = await request.json();

  const booking = await db.query('SELECT status FROM bookings WHERE id = $1', [params.bookingId]);
  if (!booking.rows[0]) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  if (booking.rows[0].status !== 'active') {
    return NextResponse.json({ error: 'Booking is not open for check-in' }, { status: 400 });
  }

  await db.query(
    `UPDATE bookings
     SET status = 'cancelled', companion_mismatch_reported = TRUE, mismatch_note = $1
     WHERE id = $2`,
    [note || 'Client reported a different companion showed up', params.bookingId]
  );

  // No payout fires for cancelled bookings — refund handling goes here (Razorpay refund API).
  return NextResponse.json({ success: true, message: 'Reported. Booking cancelled.' });
}
