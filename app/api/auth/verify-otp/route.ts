import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) {
      return NextResponse.json({ error: 'email and otp required' }, { status: 400 });
    }

    const record = await db.query(
      `SELECT id FROM login_email_otps
       WHERE email = $1 AND otp_code = $2 AND consumed = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );
    if (!record.rows[0]) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    await db.query('UPDATE login_email_otps SET consumed = TRUE WHERE id = $1', [record.rows[0].id]);

    const user = await db.query(
      'SELECT id, name, role FROM users WHERE email = $1',
      [email]
    );
    const u = user.rows[0];
    if (!u) {
      return NextResponse.json({ error: 'No account with this email' }, { status: 404 });
    }

    const token = await new SignJWT({ userId: u.id, role: u.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(new TextEncoder().encode(process.env.SESSION_SECRET));

    const res = NextResponse.json({ success: true, user: u });
    res.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    console.error('verify-otp failed', err);
    return NextResponse.json({ error: 'Could not verify OTP. Try again.' }, { status: 500 });
  }
}
