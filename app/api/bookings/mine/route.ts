import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const result = await db.query(
    `SELECT b.id, b.status, b.amount_paid, b.booking_date, b.payout_status,
            client.name AS client_name, client.phone_number AS client_phone,
            companion.name AS companion_name,
            CASE WHEN b.status IN ('active', 'completed')
                 THEN companion.phone_number ELSE NULL END AS companion_phone
     FROM bookings b
     JOIN users client ON client.id = b.client_id
     JOIN users companion ON companion.id = b.companion_id
     WHERE b.client_id = $1 OR b.companion_id = $1
     ORDER BY b.created_at DESC`,
    [session.userId]
  );

  let availabilityDates: string[] = [];
  if (session.role === 'companion') {
    const meta = await db.query(
      'SELECT availability_dates FROM companions_meta WHERE id = $1',
      [session.userId]
    );
    const raw = meta.rows[0]?.availability_dates;
    if (Array.isArray(raw)) {
      availabilityDates = raw;
    } else if (typeof raw === 'string') {
      availabilityDates = raw
        .replace(/^\{|\}$/g, '')
        .split(',')
        .map((d) => d.trim().replace(/^"|"$/g, ''))
        .filter(Boolean);
    }
  }

  return NextResponse.json({
    role: session.role,
    bookings: result.rows,
    availabilityDates,
  });
}
