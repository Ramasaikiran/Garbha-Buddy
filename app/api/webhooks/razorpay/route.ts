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
         SET status = 'active', razorpay_payment_id = $1, payout_status = 'escrow'
         WHERE id = $2 AND status = 'pending'`,
        [payment.id, bookingId]
      );
    }
  }

  if (event.event === 'payment.failed') {
    const payment = event.payload.payment.entity;
    const bookingId = payment.notes?.bookingId;
    if (bookingId) {
      // Keep status 'pending' and clear the order id so the client can
      // retry with a fresh order. Marking this 'cancelled' would be wrong:
      // it's indistinguishable from a real cancellation in admin stats,
      // and create-order refuses to issue a new order for anything but
      // a 'pending' booking, permanently locking the client out.
      await db.query(
        `UPDATE bookings SET razorpay_order_id = NULL WHERE id = $1 AND status = 'pending'`,
        [bookingId]
      );
    }
  }

  return NextResponse.json({ received: true });
}
