import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createHmac, timingSafeEqual } from 'crypto';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature') || '';

  const expected = createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex');

  const expectedBuf = Buffer.from(expected, 'hex');
  const signatureBuf = Buffer.from(signature, 'hex');
  const signatureValid =
    expectedBuf.length === signatureBuf.length && timingSafeEqual(expectedBuf, signatureBuf);

  if (!signatureValid) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error('razorpay webhook: malformed JSON body', err);
    return NextResponse.json({ error: 'Malformed body' }, { status: 400 });
  }

  // Match on order_id, not payment.notes.bookingId: order_id is a required
  // core field on every payment entity, always present. notes are
  // best-effort copied from the order and not guaranteed to propagate
  // (e.g. webhook replay, some payment methods) — relying on them meant a
  // captured payment could silently never flip the booking to 'active',
  // leaving the client charged with a booking stuck on 'pending' forever.
  // We already store razorpay_order_id ourselves when the order was created,
  // so this removes the dependency entirely.

  try {
    if (event.event === 'payment.captured') {
      const orderId = event.payload?.payment?.entity?.order_id;
      const paymentId = event.payload?.payment?.entity?.id;
      if (orderId) {
        await db.query(
          `UPDATE bookings
           SET status = 'active', razorpay_payment_id = $1, payout_status = 'escrow'
           WHERE razorpay_order_id = $2 AND status = 'pending'`,
          [paymentId, orderId]
        );
      }
    }

    // Deliberately no handling for 'payment.failed': a failed attempt
    // doesn't need any booking update. Status is already 'pending', and
    // create-order already reuses the existing razorpay_order_id for a
    // retry — Razorpay allows retrying payment against the same order.
    // (Previously this cleared razorpay_order_id here, but Razorpay can
    // send payment.failed for one attempt and payment.captured for a later
    // retry on the SAME order_id within one checkout session — clearing it
    // on failure meant the later captured event could no longer find the
    // booking by order_id, so a payment that actually succeeded would never
    // activate the booking.)
  } catch (err) {
    console.error('razorpay webhook: failed to process event', event.event, err);
    // Still 200: Razorpay retries on non-2xx, and retrying a malformed/
    // unexpected payload will fail identically every time.
  }

  return NextResponse.json({ received: true });
}
