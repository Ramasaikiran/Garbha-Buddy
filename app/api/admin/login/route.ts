import { NextResponse } from 'next/server';
import { createAdminSession, ADMIN_COOKIE_NAME } from '@/lib/admin-session';

export async function POST(request: Request) {
  const { secret } = await request.json();

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Incorrect admin secret' }, { status: 401 });
  }

  const session = await createAdminSession();
  const res = NextResponse.json({ success: true });
  res.cookies.set(session.name, session.value, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 12, // 12h
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, '', { maxAge: 0 });
  return res;
}
