import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';
import { createAdminSession, ADMIN_COOKIE_NAME } from '@/lib/admin-session';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Supabase verifies the credential itself — we never see or store the password.
    const { data, error } = await getSupabaseAdmin().auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });
    }

    // Being a valid Supabase login isn't enough — must also be a designated admin.
    const result = await db.query(
      'SELECT id, email FROM admin_users WHERE auth_user_id = $1 OR email = $2',
      [data.user.id, email]
    );
    const admin = result.rows[0];
    if (!admin) {
      return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });
    }

    const session = await createAdminSession({ id: admin.id, email: admin.email });
    const res = NextResponse.json({ success: true });
    res.cookies.set(session.name, session.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 12, // 12h
    });
    return res;
  } catch (err) {
    console.error('admin login failed', err);
    return NextResponse.json({ error: 'Login failed. Try again.' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, '', { maxAge: 0 });
  return res;
}
