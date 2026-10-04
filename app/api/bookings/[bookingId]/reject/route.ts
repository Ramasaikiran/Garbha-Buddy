import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRazorpay } from '@/lib/razorpay';
import { getSession } from '@/lib/session';

export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const { note } = await request.json().catch(() => ({ note: undefined }));

  const conn = await db.connect();
  try {
    await conn.query('BEGIN');
    // Row lock: prevents a double refund on repeated taps.
    const booking = await conn.query(
      'SELECT status, razorpay_payment_id, amount_paid, client_id FROM bookings WHERE id = $1 FOR UPDATE',
      [params.bookingId]
    );
    if (!booking.rows[0]) {
      await conn.query('ROLLBACK');
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (booking.rows[0].client_id !== session.userId) {
      await conn.query('ROLLBACK');
      return NextResponse.json({ error: 'Not authorized for this booking' }, { status: 403 });
    }
    if (booking.rows[0].status !== 'active') {
      await conn.query('ROLLBACK');
      return NextResponse.json({ error: 'Booking is not open for check-in' }, { status: 400 });
    }

    const { razorpay_payment_id, amount_paid } = booking.rows[0];
    let refundStatus: 'refunded' | 'refund_failed' | 'no_payment' = 'no_payment';
    let refundError: string | null = null;

    if (razorpay_payment_id) {
      try {
        await getRazorpay().payments.refund(razorpay_payment_id, {
          amount: Math.round(amount_paid * 100), // full refund, in paise
          speed: 'normal',
          notes: { bookingId: params.bookingId, reason: 'companion_mismatch' },
        });
        refundStatus = 'refunded';
      } catch (err: any) {
        console.error('refund failed for booking', params.bookingId, err);
        refundStatus = 'refund_failed';
        refundError = err?.error?.description || err?.message || 'Unknown refund error';
      }
    }

    await conn.query(
      `UPDATE bookings
       SET status = 'cancelled',
           companion_mismatch_reported = TRUE,
           mismatch_note = $1,
           cancellation_reason = 'companion_mismatch',
           refund_amount = $2,
           payout_status = $3
       WHERE id = $4`,
      [
        `${note || 'Client reported a different companion showed up'}${
          refundError ? ` | refund error: ${refundError}` : ''
        }`,
        refundStatus === 'refunded' ? amount_paid : null,
        refundStatus === 'refunded' ? 'refunded' : 'failed',
        params.bookingId,
      ]
    );
    await conn.query('COMMIT');

    return NextResponse.json({
      success: true,
      message:
        refundStatus === 'refunded'
          ? 'Reported. Booking cancelled and refund issued.'
          : refundStatus === 'refund_failed'
          ? 'Reported. Booking cancelled. Refund could not be processed automatically, our team will follow up.'
          : 'Reported. Booking cancelled.',
      refundStatus,
    });
  } catch (err) {
    await conn.query('ROLLBACK').catch(() => {});
    console.error('mismatch report failed', params.bookingId, err);
    return NextResponse.json({ error: 'Could not process this report. Try again.' }, { status: 500 });
  } finally {
    conn.release();
  }
}
