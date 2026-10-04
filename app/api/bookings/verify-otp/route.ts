import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { timingSafeEqual } from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const { bookingId, enteredOtp: rawOtp } = await request.json().catch(() => ({} as any));
    const enteredOtp = rawOtp == null ? '' : String(rawOtp).trim();
    if (!bookingId || !enteredOtp) {
      return NextResponse.json({ error: 'bookingId and enteredOtp required' }, { status: 400 });
    }

    const booking = await db.query(
      'SELECT otp_code, status, client_id FROM bookings WHERE id = $1',
      [bookingId]
    );
    if (!booking.rows[0]) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (booking.rows[0].client_id !== session.userId) {
      return NextResponse.json({ error: 'Not authorized for this booking' }, { status: 403 });
    }
    if (booking.rows[0].status !== 'active') {
      return NextResponse.json(
        { error: 'Booking must be paid and active before check-in' },
        { status: 400 }
      );
    }
    const expected = Buffer.from(String(booking.rows[0].otp_code ?? ''));
    const given = Buffer.from(enteredOtp);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    const done = await db.query(
      `UPDATE bookings SET status = 'completed' WHERE id = $1 AND status = 'active'`,
      [bookingId]
    );
    if (!done.rowCount) {
      return NextResponse.json({ error: 'Booking is no longer active' }, { status: 409 });
    }

    return NextResponse.json({ success: true, message: 'Checked in. Enjoy the night!' });
  } catch (err) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
