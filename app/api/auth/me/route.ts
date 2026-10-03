import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const result = await db.query(
    `SELECT name, email, phone_number FROM users WHERE id = $1`,
    [session.userId]
  );

  return NextResponse.json({
    userId: session.userId,
    role: session.role,
    name: result.rows[0]?.name ?? null,
    email: result.rows[0]?.email ?? null,
    phoneNumber: result.rows[0]?.phone_number ?? null,
  });
}
