import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    const user = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (!user.rows[0]) {
      return NextResponse.json({ error: 'No account with this email' }, { status: 404 });
    }

    const { error } = await getSupabaseAdmin().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (error) {
      console.error('supabase signInWithOtp (login) failed', error);
      return NextResponse.json({ error: 'Could not send OTP. Try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    console.error('request-otp failed', err);
    return NextResponse.json({ error: 'Could not send OTP. Try again.' }, { status: 500 });
  }
}
