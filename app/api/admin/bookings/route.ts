import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin-session';

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bookings = await db.query(
    `SELECT b.id, b.status, b.amount_paid, b.booking_date, b.payout_status,
            b.razorpay_order_id, b.razorpay_payment_id, b.created_at,
            b.cancellation_reason, b.refund_amount,
            client.name AS client_name, client.phone_number AS client_phone,
            companion.name AS companion_name, companion.phone_number AS companion_phone
     FROM bookings b
     JOIN users client ON client.id = b.client_id
     JOIN users companion ON companion.id = b.companion_id
     ORDER BY b.created_at DESC`
  );

  const stats = await db.query(
    `SELECT
       COUNT(*)::int AS total_bookings,
       COALESCE(SUM(amount_paid) FILTER (WHERE status <> 'cancelled'), 0)::int AS total_revenue,
       COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_count,
       COUNT(*) FILTER (WHERE status = 'active')::int AS active_count,
       COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_count,
       COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled_count,
       COUNT(*) FILTER (WHERE payout_status = 'pending')::int AS payout_pending_count,
       COUNT(*) FILTER (WHERE payout_status = 'escrow')::int AS payout_escrow_count,
       COUNT(*) FILTER (WHERE payout_status = 'paid_out')::int AS payout_paid_count,
       COUNT(*) FILTER (WHERE payout_status = 'refunded')::int AS payout_refunded_count
     FROM bookings`
  );

  const penalties = await db.query(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0)::int AS penalties_pending,
       COALESCE(SUM(amount) FILTER (WHERE status = 'deducted'), 0)::int AS penalties_deducted
     FROM companion_penalties`
  );

  return NextResponse.json({
    bookings: bookings.rows,
    stats: { ...stats.rows[0], ...penalties.rows[0] },
  });
}
