import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const result = await db.query(
    `SELECT b.id, b.status, b.amount_paid, b.booking_date, b.payout_status,
            client.name AS client_name, companion.name AS companion_name
     FROM bookings b
     JOIN users client ON client.id = b.client_id
     JOIN users companion ON companion.id = b.companion_id
     WHERE b.client_id = $1 OR b.companion_id = $1
     ORDER BY b.created_at DESC`,
    [session.userId]
  );

  return NextResponse.json({ bookings: result.rows });
}
