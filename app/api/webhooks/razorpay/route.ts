import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createHmac } from 'crypto';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature') || '';

  const expected = createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex');

  if (expected !== signature) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const bookingId = payment.notes?.bookingId;
    if (bookingId) {
      await db.query(
        `UPDATE bookings
         SET status = 'active', razorpay_payment_id = $1
         WHERE id = $2 AND status = 'pending'`,
        [payment.id, bookingId]
      );
    }
  }

  if (event.event === 'payment.failed') {
    const payment = event.payload.payment.entity;
    const bookingId = payment.notes?.bookingId;
    if (bookingId) {
      await db.query(
        `UPDATE bookings SET status = 'cancelled' WHERE id = $1 AND status = 'pending'`,
        [bookingId]
      );
    }
  }

  return NextResponse.json({ received: true });
}
