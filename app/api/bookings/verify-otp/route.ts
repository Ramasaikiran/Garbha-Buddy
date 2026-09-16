import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { bookingId, enteredOtp } = await request.json();
    if (!bookingId || !enteredOtp) {
      return NextResponse.json({ error: 'bookingId and enteredOtp required' }, { status: 400 });
    }

    const booking = await db.query(
      'SELECT otp_code, status FROM bookings WHERE id = $1',
      [bookingId]
    );
    if (!booking.rows[0]) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (booking.rows[0].status !== 'active') {
      return NextResponse.json(
        { error: 'Booking must be paid and active before check-in' },
        { status: 400 }
      );
    }
    if (booking.rows[0].otp_code !== enteredOtp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    await db.query(`UPDATE bookings SET status = 'completed' WHERE id = $1`, [bookingId]);

    return NextResponse.json({ success: true, message: 'Checked in. Enjoy the night!' });
  } catch (err) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
