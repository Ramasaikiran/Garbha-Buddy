import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const result = await db.query(
    `SELECT b.id, b.status, b.otp_code, b.client_id, b.companion_id,
            companion.name AS companion_name, companion.selfie_url
     FROM bookings b
     JOIN users companion ON companion.id = b.companion_id
     WHERE b.id = $1`,
    [params.bookingId]
  );
  const booking = result.rows[0];
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  if (booking.client_id !== session.userId && booking.companion_id !== session.userId) {
    return NextResponse.json({ error: 'Not authorized to view this booking' }, { status: 403 });
  }

  // otp_code withheld from the client-facing response; only companion states it aloud at the gate
  const { otp_code, client_id, companion_id, ...safe } = booking;
  return NextResponse.json({ booking: safe });
}
