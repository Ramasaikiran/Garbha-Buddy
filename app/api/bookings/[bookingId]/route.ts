import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  const result = await db.query(
    `SELECT b.id, b.status, b.otp_code, companion.name AS companion_name, companion.selfie_url
     FROM bookings b
     JOIN users companion ON companion.id = b.companion_id
     WHERE b.id = $1`,
    [params.bookingId]
  );
  if (!result.rows[0]) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  // otp_code withheld from the client-facing response; only companion states it aloud at the gate
  const { otp_code, ...safe } = result.rows[0];
  return NextResponse.json({ booking: safe });
}
