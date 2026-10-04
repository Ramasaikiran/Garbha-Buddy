import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { COMPANION_SHARE } from '@/lib/razorpay';

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
    `SELECT b.id, b.amount_paid, b.companion_id, cm.razorpayx_fund_account_id
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

    let payoutRupees = Math.round(row.amount_paid * COMPANION_SHARE);
    const penalties = await db.query(
      `SELECT id, amount FROM companion_penalties
       WHERE companion_id = $1 AND status = 'pending'
       ORDER BY created_at ASC`,
      [row.companion_id]
    );

    const settledPenaltyIds: string[] = [];
    let partialPenalty: { id: string; remaining: number } | null = null;
    for (const penalty of penalties.rows) {
      if (payoutRupees <= 0) break;
      const deduction = Math.min(penalty.amount, payoutRupees);
      payoutRupees -= deduction;
      if (deduction === penalty.amount) {
        settledPenaltyIds.push(penalty.id);
      } else {
        // Partially repaid: shrink the pending amount so the same rupees
        // are not deducted again from the next payout.
        partialPenalty = { id: penalty.id, remaining: penalty.amount - deduction };
        break;
      }
    }

    async function settlePenalties() {
      if (settledPenaltyIds.length) {
        await db.query(
          `UPDATE companion_penalties SET status = 'deducted' WHERE id = ANY($1::uuid[])`,
          [settledPenaltyIds]
        );
      }
      if (partialPenalty) {
        await db.query(`UPDATE companion_penalties SET amount = $1 WHERE id = $2`, [
          partialPenalty.remaining,
          partialPenalty.id,
        ]);
      }
    }

    const payoutAmount = Math.round(payoutRupees * 100); // paise

    if (payoutAmount <= 0) {
      await settlePenalties();
      await db.query(`UPDATE bookings SET payout_status = 'paid_out' WHERE id = $1`, [row.id]);
      results.push({ bookingId: row.id, paid: true, amount: 0, note: 'fully offset by penalty' });
      continue;
    }

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
          // Same booking always maps to the same key, so a retry after a
          // crash or a concurrent run cannot pay the companion twice.
          'X-Payout-Idempotency': `booking_${row.id}`,
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
      await settlePenalties();
      results.push({ bookingId: row.id, paid: true, amount: payoutRupees });
    } catch (err: any) {
      results.push({ bookingId: row.id, error: err.message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
