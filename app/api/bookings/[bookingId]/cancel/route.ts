import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRazorpay } from '@/lib/razorpay';
import { getSession } from '@/lib/session';

// Client-initiated cancellation of their own booking.
// >24h before the date: 80% refunded, 20% kept.
// <=24h before the date: 70% refunded, 30% kept.
export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const booking = await db.query(
    `SELECT status, razorpay_payment_id, amount_paid, client_id, booking_date
     FROM bookings WHERE id = $1`,
    [params.bookingId]
  );
  const row = booking.rows[0];
  if (!row) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  if (row.client_id !== session.userId) {
    return NextResponse.json({ error: 'Not authorized for this booking' }, { status: 403 });
  }
  if (row.status !== 'active') {
    return NextResponse.json(
      { error: 'Only a paid, upcoming booking can be cancelled this way' },
      { status: 400 }
    );
  }

  const hoursUntil = (new Date(row.booking_date).getTime() - Date.now()) / (1000 * 60 * 60);
  const refundPct = hoursUntil <= 24 ? 0.7 : 0.8;
  const refundAmount = Math.round(row.amount_paid * refundPct);

  let refundSucceeded = false;
  let refundError: string | null = null;

  if (row.razorpay_payment_id) {
    try {
      await getRazorpay().payments.refund(row.razorpay_payment_id, {
        amount: refundAmount * 100, // paise
        speed: 'normal',
        notes: { bookingId: params.bookingId, reason: 'client_cancelled' },
      });
      refundSucceeded = true;
    } catch (err: any) {
      console.error('client cancellation refund failed', params.bookingId, err);
      refundError = err?.error?.description || err?.message || 'Unknown refund error';
    }
  }

  await db.query(
    `UPDATE bookings
     SET status = 'cancelled',
         cancellation_reason = 'client_cancelled',
         refund_amount = $1,
         payout_status = 'refunded'
     WHERE id = $2`,
    [refundAmount, params.bookingId]
  );

  return NextResponse.json({
    success: true,
    refundPercent: Math.round(refundPct * 100),
    refundAmount,
    refundSucceeded,
    message: refundSucceeded
      ? `Booking cancelled. ₹${refundAmount} (${Math.round(refundPct * 100)}%) refunded.`
      : `Booking cancelled. Refund of ₹${refundAmount} could not be processed automatically — our team will follow up.${
          refundError ? ` (${refundError})` : ''
        }`,
  });
}
