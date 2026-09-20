import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin().auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });
    }

    const user = await db.query('SELECT id, name, role FROM users WHERE email = $1', [email]);
    const u = user.rows[0];
    if (!u) {
      return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });
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
    console.error('login failed', err);
    return NextResponse.json({ error: 'Login failed. Try again.' }, { status: 500 });
  }
}
