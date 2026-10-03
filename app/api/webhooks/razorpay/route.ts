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

  // Match on order_id, not payment.notes.bookingId: order_id is a required
  // core field on every payment entity, always present. notes are
  // best-effort copied from the order and not guaranteed to propagate
  // (e.g. webhook replay, some payment methods) — relying on them meant a
  // captured payment could silently never flip the booking to 'active',
  // leaving the client charged with a booking stuck on 'pending' forever.
  // We already store razorpay_order_id ourselves when the order was created,
  // so this removes the dependency entirely.

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;
    if (orderId) {
      await db.query(
        `UPDATE bookings
         SET status = 'active', razorpay_payment_id = $1, payout_status = 'escrow'
         WHERE razorpay_order_id = $2 AND status = 'pending'`,
        [payment.id, orderId]
      );
    }
  }

  if (event.event === 'payment.failed') {
    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;
    if (orderId) {
      // Keep status 'pending' and clear the order id so the client can
      // retry with a fresh order. Marking this 'cancelled' would be wrong:
      // it's indistinguishable from a real cancellation in admin stats,
      // and create-order refuses to issue a new order for anything but
      // a 'pending' booking, permanently locking the client out.
      await db.query(
        `UPDATE bookings SET razorpay_order_id = NULL WHERE razorpay_order_id = $1 AND status = 'pending'`,
        [orderId]
      );
    }
  }

  return NextResponse.json({ received: true });
}
