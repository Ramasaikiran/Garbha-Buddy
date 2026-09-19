import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const COMPANION_SHARE = 0.7;

// Trigger via Vercel Cron (GET, auth header auto-added by Vercel using
// CRON_SECRET) or manually via POST with the same Bearer header.
export async function GET(request: Request) {
  return handlePayouts(request);
}

export async function POST(request: Request) {
  return handlePayouts(request);
}

async function handlePayouts(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const due = await db.query(
    `SELECT b.id, b.amount_paid, cm.razorpayx_fund_account_id
     FROM bookings b
     JOIN companions_meta cm ON cm.id = b.companion_id
     WHERE b.status = 'completed' AND b.payout_status = 'escrow'`
  );

  const results = [];
  for (const row of due.rows) {
    if (!row.razorpayx_fund_account_id) {
      results.push({ bookingId: row.id, skipped: 'no payout account on file' });
      continue;
    }

    const payoutAmount = Math.round(row.amount_paid * COMPANION_SHARE * 100); // paise

    try {
      const res = await fetch('https://api.razorpay.com/v1/payouts', {
        method: 'POST',
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(
              `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
            ).toString('base64'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER,
          fund_account_id: row.razorpayx_fund_account_id,
          amount: payoutAmount,
          currency: 'INR',
          mode: 'UPI',
          purpose: 'payout',
          queue_if_low_balance: true,
          reference_id: `booking_${row.id}`,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      await db.query(`UPDATE bookings SET payout_status = 'paid_out' WHERE id = $1`, [row.id]);
      results.push({ bookingId: row.id, paid: true });
    } catch (err: any) {
      results.push({ bookingId: row.id, error: err.message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
