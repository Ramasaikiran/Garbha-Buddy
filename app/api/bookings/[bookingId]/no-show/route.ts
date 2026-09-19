import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRazorpay } from '@/lib/razorpay';
import { getSession } from '@/lib/session';

const COMPANION_NO_SHOW_PENALTY = 0.3;

// Client reports the companion never arrived. Client gets a full refund;
// the companion is penalized 30% of the booking value, deducted from
// their next completed-booking payout (see /api/cron/payouts).
export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { note } = await request.json().catch(() => ({ note: undefined }));

  const booking = await db.query(
    `SELECT status, razorpay_payment_id, amount_paid, client_id, companion_id
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
      { error: 'This can only be reported for a paid, upcoming booking' },
      { status: 400 }
    );
  }

  let refundSucceeded = false;
  let refundError: string | null = null;

  if (row.razorpay_payment_id) {
    try {
      await getRazorpay().payments.refund(row.razorpay_payment_id, {
        amount: Math.round(row.amount_paid * 100), // full refund, paise
        speed: 'normal',
        notes: { bookingId: params.bookingId, reason: 'companion_no_show' },
      });
      refundSucceeded = true;
    } catch (err: any) {
      console.error('no-show refund failed', params.bookingId, err);
      refundError = err?.error?.description || err?.message || 'Unknown refund error';
    }
  }

  const penaltyAmount = Math.round(row.amount_paid * COMPANION_NO_SHOW_PENALTY);

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE bookings
       SET status = 'cancelled',
           cancellation_reason = 'companion_no_show',
           refund_amount = $1,
           cancellation_note = $2,
           payout_status = 'refunded'
       WHERE id = $3`,
      [row.amount_paid, note || 'Companion did not arrive', params.bookingId]
    );
    await client.query(
      `INSERT INTO companion_penalties (companion_id, booking_id, amount)
       VALUES ($1, $2, $3)`,
      [row.companion_id, params.bookingId, penaltyAmount]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('no-show booking update failed', err);
    return NextResponse.json({ error: 'Could not process this report. Try again.' }, { status: 500 });
  } finally {
    client.release();
  }

  return NextResponse.json({
    success: true,
    refundSucceeded,
    message: refundSucceeded
      ? 'Reported. Booking cancelled and you\u2019ve been fully refunded.'
      : `Reported. Booking cancelled — refund could not be processed automatically, our team will follow up.${
          refundError ? ` (${refundError})` : ''
        }`,
  });
}
