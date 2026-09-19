import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

// One-time bootstrap: creates the first admin account.
// Gated by ADMIN_SECRET (the env var you already have set) so only you can
// call it. After your first admin_users row exists, use /admin/login instead.
export async function POST(request: Request) {
  try {
    const { secret, email, password } = await request.json();

    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Incorrect setup secret' }, { status: 401 });
    }
    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: 'Email and a password of at least 8 characters are required' },
        { status: 400 }
      );
    }

    const existing = await db.query('SELECT id FROM admin_users LIMIT 1');
    if (existing.rows[0]) {
      return NextResponse.json(
        { error: 'An admin account already exists. Use /admin/login instead.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await db.query(
      'INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)',
      [email, passwordHash]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('admin setup failed', err);
    return NextResponse.json({ error: 'Setup failed. Try again.' }, { status: 500 });
  }
}
