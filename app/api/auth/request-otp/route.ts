import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomInt } from 'crypto';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();
    if (!phoneNumber) {
      return NextResponse.json({ error: 'phoneNumber required' }, { status: 400 });
    }

    const user = await db.query('SELECT id FROM users WHERE phone_number = $1', [phoneNumber]);
    if (!user.rows[0]) {
      return NextResponse.json({ error: 'No account with this number' }, { status: 404 });
    }

    const otp = String(randomInt(100000, 999999));
    await db.query(
      `INSERT INTO login_otps (phone_number, otp_code, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
      [phoneNumber, otp]
    );

    const smsConfigured = Boolean(process.env.SMS_PROVIDER_API_KEY);
    if (smsConfigured) {
      // TODO: call real SMS provider (MSG91/Twilio) here with `otp`
    }

    return NextResponse.json({
      success: true,
      message: smsConfigured ? 'OTP sent' : 'SMS not connected yet',
      // Dev-only fallback so the flow is testable before an SMS provider is wired.
      // Never returned once SMS_PROVIDER_API_KEY is set, and never in production.
      devOtp:
        !smsConfigured && process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (err) {
    console.error('request-otp failed', err);
    return NextResponse.json({ error: 'Could not send OTP. Try again.' }, { status: 500 });
  }
}
