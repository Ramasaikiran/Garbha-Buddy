import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomInt } from 'crypto';
import { TIER_AMOUNTS } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const {
      name,
      gender,
      phoneNumber,
      companionId,
      bookingDate,
      ticketLiabilityAccepted,
      aadhaarFrontUrl,
      aadhaarBackUrl,
      aadhaarLast4,
      selfieUrl,
    } = await request.json();

    if (!name || !gender || !phoneNumber || !aadhaarFrontUrl || !aadhaarBackUrl || !selfieUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (companionId && !ticketLiabilityAccepted) {
      return NextResponse.json(
        { error: 'You must confirm the ticket liability terms before booking' },
        { status: 400 }
      );
    }

    // 1. Create the client user
    const userResult = await db.query(
      `INSERT INTO users
        (name, gender, phone_number, role, aadhaar_front_url, aadhaar_back_url, aadhaar_last4, selfie_url)
       VALUES ($1, $2, $3, 'client', $4, $5, $6, $7)
       RETURNING id`,
      [name, gender, phoneNumber, aadhaarFrontUrl, aadhaarBackUrl, aadhaarLast4 || null, selfieUrl]
    );
    const clientId = userResult.rows[0].id;

    // 2. If they arrived via a shareable link, start a pending booking
    let booking = null;
    if (companionId) {
      const companionRow = await db.query(
        'SELECT preference, tier FROM companions_meta WHERE id = $1',
        [companionId]
      );
      if (!companionRow.rows[0]) {
        return NextResponse.json({ error: 'Companion not found' }, { status: 404 });
      }
      if (
        companionRow.rows[0].preference === 'girls_only' &&
        gender.toLowerCase() !== 'female'
      ) {
        return NextResponse.json(
          { error: 'This companion only accepts female clients' },
          { status: 400 }
        );
      }

      const amount = TIER_AMOUNTS[companionRow.rows[0].tier] ?? TIER_AMOUNTS.gold;
      const otp = String(randomInt(100000, 999999));
      const bookingResult = await db.query(
        `INSERT INTO bookings
          (client_id, companion_id, amount_paid, otp_code, booking_date, ticket_liability_accepted)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [clientId, companionId, amount, otp, bookingDate || new Date(), true]
      );
      booking = { id: bookingResult.rows[0].id, amount };
    }

    return NextResponse.json({ success: true, clientId, booking });
  } catch (err) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
