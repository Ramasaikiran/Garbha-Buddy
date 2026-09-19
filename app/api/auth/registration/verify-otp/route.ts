import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signEmailVerificationToken } from '@/lib/email-verification';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) {
      return NextResponse.json({ error: 'email and otp required' }, { status: 400 });
    }

    const record = await db.query(
      `SELECT id FROM signup_email_otps
       WHERE email = $1 AND otp_code = $2 AND consumed = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );
    if (!record.rows[0]) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    await db.query('UPDATE signup_email_otps SET consumed = TRUE WHERE id = $1', [record.rows[0].id]);

    const verificationToken = await signEmailVerificationToken(email);
    return NextResponse.json({ success: true, verificationToken });
  } catch (err) {
    console.error('registration verify-otp failed', err);
    return NextResponse.json({ error: 'Could not verify code. Try again.' }, { status: 500 });
  }
}
