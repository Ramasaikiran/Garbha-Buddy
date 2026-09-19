import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomInt } from 'crypto';
import { sendSignupVerificationEmail } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows[0]) {
      return NextResponse.json(
        { error: 'This email is already registered to another account' },
        { status: 409 }
      );
    }

    const otp = String(randomInt(100000, 999999));
    await db.query(
      `INSERT INTO signup_email_otps (email, otp_code, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
      [email, otp]
    );

    const resendConfigured = Boolean(process.env.RESEND_API_KEY);
    if (resendConfigured) {
      await sendSignupVerificationEmail(email, otp);
    }

    return NextResponse.json({
      success: true,
      message: resendConfigured ? 'Verification code sent' : 'Email not connected yet',
      // Dev-only fallback so the flow is testable before Resend is wired.
      devOtp:
        !resendConfigured && process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (err) {
    console.error('registration request-otp failed', err);
    return NextResponse.json({ error: 'Could not send verification code. Try again.' }, { status: 500 });
  }
}
