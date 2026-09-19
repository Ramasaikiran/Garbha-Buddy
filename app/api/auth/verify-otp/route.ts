import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) {
      return NextResponse.json({ error: 'email and otp required' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin().auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const user = await db.query(
      'SELECT id, name, role FROM users WHERE email = $1',
      [email]
    );
    const u = user.rows[0];
    if (!u) {
      return NextResponse.json({ error: 'No account with this email' }, { status: 404 });
    }

    // Our own session cookie, unchanged from before — Supabase only handled
    // the OTP itself, not ongoing session/authorization for the rest of the app.
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
