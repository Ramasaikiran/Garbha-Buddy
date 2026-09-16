import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomInt } from 'crypto';

export async function POST(request: Request) {
  const { phoneNumber } = await request.json();
  if (!phoneNumber) {
    return NextResponse.json({ error: 'phoneNumber required' }, { status: 400 });
  }

  const user = await db.query('SELECT id FROM users WHERE phone_number = $1', [phoneNumber]);
  if (!user.rows[0]) {
    return NextResponse.json({ error: 'No account with this number' }, { status: 404 });
  }

  const otp = String(randomInt(100000, 999999));
  await db.query(
    `INSERT INTO login_otps (phone_number, otp_code, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
    [phoneNumber, otp]
  );

  // TODO: wire to SMS provider (e.g. MSG91, Twilio) — send `otp` to phoneNumber
  return NextResponse.json({ success: true, message: 'OTP sent' });
}
