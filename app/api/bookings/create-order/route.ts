import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { razorpay } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId required' }, { status: 400 });
    }

    const bookingResult = await db.query(
      `SELECT amount_paid, status, razorpay_order_id FROM bookings WHERE id = $1`,
      [bookingId]
    );
    const booking = bookingResult.rows[0];
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (booking.status !== 'pending') {
      return NextResponse.json({ error: 'Booking is not payable' }, { status: 400 });
    }

    // Reuse an existing order if the client retries before paying
    if (booking.razorpay_order_id) {
      return NextResponse.json({
        orderId: booking.razorpay_order_id,
        amount: booking.amount_paid * 100,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(booking.amount_paid * 100), // paise
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      notes: { bookingId },
    });

    await db.query(`UPDATE bookings SET razorpay_order_id = $1 WHERE id = $2`, [
      order.id,
      bookingId,
    ]);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Could not create payment order' }, { status: 500 });
  }
}
