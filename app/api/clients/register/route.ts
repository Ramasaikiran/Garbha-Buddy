import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomInt } from 'crypto';
import { TIER_AMOUNTS } from '@/lib/razorpay';
import { verifyEmailVerificationToken } from '@/lib/email-verification';
import { getSupabaseAdmin } from '@/lib/supabase';

function isValidUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    console.error('client registration: could not parse request body', err);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const {
      name,
      gender,
      email,
      password,
      confirmPassword,
      phoneNumber,
      companionId,
      bookingDate,
      ticketLiabilityAccepted,
      aadhaarFrontUrl,
      aadhaarBackUrl,
      aadhaarLast4,
      selfieUrl,
      emailVerificationToken,
    } = body;

    if (!name || !gender || !email || !phoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const emailVerification = await verifyEmailVerificationToken(emailVerificationToken, email);
    if (!emailVerification.valid) {
      return NextResponse.json(
        { error: 'Please verify your email with the code we sent before continuing' },
        { status: 400 }
      );
    }
    const authUserId = emailVerification.authUserId;

    if (authUserId) {
      const { error: pwError } = await getSupabaseAdmin().auth.admin.updateUserById(authUserId, {
        password,
      });
      if (pwError) {
        console.error('client registration: could not set password', pwError);
        return NextResponse.json(
          { error: 'Could not set your password. Try again.' },
          { status: 500 }
        );
      }
    }

    if (!/^\d{10}$/.test(String(phoneNumber))) {
      return NextResponse.json(
        { error: 'Phone number must be exactly 10 digits, numbers only' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
    }

    const linkFields: Record<string, unknown> = {
      'Aadhaar front': aadhaarFrontUrl,
      'Aadhaar back': aadhaarBackUrl,
      Selfie: selfieUrl,
    };
    for (const [label, value] of Object.entries(linkFields)) {
      if (!value) {
        return NextResponse.json({ error: `${label} is required` }, { status: 400 });
      }
      if (!isValidUrl(value)) {
        return NextResponse.json(
          { error: `${label} must be a link starting with http:// or https://, not plain text` },
          { status: 400 }
        );
      }
    }

    if (companionId && !ticketLiabilityAccepted) {
      return NextResponse.json(
        { error: 'You must confirm the ticket liability terms before booking' },
        { status: 400 }
      );
    }

    // Pre-check for a friendly, field-specific duplicate message; the
    // transaction's unique constraints below are the real guarantee against races.
    const existingPhone = await db.query('SELECT id FROM users WHERE phone_number = $1', [phoneNumber]);
    if (existingPhone.rows[0]) {
      return NextResponse.json(
        { error: 'This phone number is already registered to another account' },
        { status: 409 }
      );
    }
    const existingEmail = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingEmail.rows[0]) {
      return NextResponse.json(
        { error: 'This email is already registered to another account' },
        { status: 409 }
      );
    }

    // Validate the companion BEFORE creating any user row, so a rejected
    // booking never leaves an orphan account behind.
    let companionRow: { preference: string; tier: string } | null = null;
    if (companionId) {
      const result = await db.query(
        `SELECT cm.preference, cm.tier, u.is_verified
         FROM companions_meta cm
         JOIN users u ON u.id = cm.id
         WHERE cm.id = $1`,
        [companionId]
      );
      if (!result.rows[0]) {
        return NextResponse.json({ error: 'Companion not found' }, { status: 404 });
      }
      if (!result.rows[0].is_verified) {
        return NextResponse.json(
          { error: 'This companion is not yet verified and cannot be booked' },
          { status: 400 }
        );
      }
      companionRow = result.rows[0];
      if (
        companionRow!.preference === 'girls_only' &&
        gender.toLowerCase() !== 'female'
      ) {
        return NextResponse.json(
          { error: 'This companion only accepts female clients' },
          { status: 400 }
        );
      }
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query(
        `INSERT INTO users
          (name, gender, email, phone_number, role, aadhaar_front_url, aadhaar_back_url, aadhaar_last4, selfie_url, auth_user_id)
         VALUES ($1, $2, $3, $4, 'client', $5, $6, $7, $8, $9)
         RETURNING id`,
        [name, gender, email, phoneNumber, aadhaarFrontUrl, aadhaarBackUrl, aadhaarLast4 || null, selfieUrl, authUserId]
      );
      const clientId = userResult.rows[0].id;

      let booking = null;
      if (companionId && companionRow) {
        const amount = TIER_AMOUNTS[companionRow.tier] ?? TIER_AMOUNTS.gold;
        const otp = String(randomInt(100000, 999999));
        const bookingResult = await client.query(
          `INSERT INTO bookings
            (client_id, companion_id, amount_paid, otp_code, booking_date, ticket_liability_accepted)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [clientId, companionId, amount, otp, bookingDate || new Date(), true]
        );
        booking = { id: bookingResult.rows[0].id, amount };
      }

      await client.query('COMMIT');
      return NextResponse.json({ success: true, clientId, booking });
    } catch (err: any) {
      await client.query('ROLLBACK');

      if (err.code === '23505') {
        return NextResponse.json(
          { error: 'An account with this phone number or email already exists. Try logging in instead.' },
          { status: 409 }
        );
      }

      console.error('client registration failed', err);
      return NextResponse.json(
        { error: 'Registration failed. Please check your details and try again.' },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('client registration failed unexpectedly', err);
    return NextResponse.json(
      { error: 'Something went wrong on our end. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
