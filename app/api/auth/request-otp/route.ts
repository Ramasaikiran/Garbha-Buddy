import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomInt } from 'crypto';
import { sendOtpEmail } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    const user = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (!user.rows[0]) {
      return NextResponse.json({ error: 'No account with this email' }, { status: 404 });
    }

    const otp = String(randomInt(100000, 999999));
    await db.query(
      `INSERT INTO login_email_otps (email, otp_code, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
      [email, otp]
    );

    const resendConfigured = Boolean(process.env.RESEND_API_KEY);
    if (resendConfigured) {
      await sendOtpEmail(email, otp);
    }

    return NextResponse.json({
      success: true,
      message: resendConfigured ? 'OTP sent' : 'Email not connected yet',
      // Dev-only fallback so the flow is testable before Resend is wired.
      // Never returned once RESEND_API_KEY is set, and never in production.
      devOtp:
        !resendConfigured && process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (err) {
    console.error('request-otp failed', err);
    return NextResponse.json({ error: 'Could not send OTP. Try again.' }, { status: 500 });
  }
}
