import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createAdminSession, ADMIN_COOKIE_NAME } from '@/lib/admin-session';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const result = await db.query(
      'SELECT id, email, password_hash FROM admin_users WHERE email = $1',
      [email]
    );
    const admin = result.rows[0];
    if (!admin) {
      return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
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
