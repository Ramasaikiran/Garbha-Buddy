import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { COMPANION_SHARE } from '@/lib/razorpay';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'companion') {
    return NextResponse.json({ error: 'Companions only' }, { status: 403 });
  }

  const result = await db.query(
    `SELECT
       COUNT(*)::int AS total_bookings,
       COUNT(DISTINCT client_id)::int AS unique_clients,
       COUNT(*) FILTER (WHERE booking_date = CURRENT_DATE)::int AS bookings_today,
       COUNT(*) FILTER (
         WHERE booking_date BETWEEN CURRENT_DATE - INTERVAL '6 days' AND CURRENT_DATE
       )::int AS bookings_last_7_days,
       COALESCE(SUM(amount_paid) FILTER (WHERE payout_status = 'escrow'), 0)::int AS pending_gross,
       COALESCE(SUM(amount_paid) FILTER (WHERE payout_status = 'paid_out'), 0)::int AS received_gross
     FROM bookings
     WHERE companion_id = $1 AND status <> 'cancelled'`,
    [session.userId]
  );

  const penalties = await db.query(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0)::int AS penalties_pending
     FROM companion_penalties
     WHERE companion_id = $1`,
    [session.userId]
  );

  const row = result.rows[0];
  const amountPending = Math.round(row.pending_gross * COMPANION_SHARE);
  const amountReceived = Math.round(row.received_gross * COMPANION_SHARE);

  return NextResponse.json({
    totalBookings: row.total_bookings,
    uniqueClients: row.unique_clients,
    bookingsToday: row.bookings_today,
    bookingsLast7Days: row.bookings_last_7_days,
    amountPending,
    amountReceived,
    penaltiesPending: penalties.rows[0].penalties_pending,
  });
}
