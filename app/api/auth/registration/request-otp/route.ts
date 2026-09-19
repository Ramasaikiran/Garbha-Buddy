import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
    }

    // A completed profile with this email already exists in our system.
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows[0]) {
      return NextResponse.json(
        { error: 'This email is already registered to another account' },
        { status: 409 }
      );
    }

    // Supabase Auth sends the OTP email (via whatever SMTP provider is
    // configured in the Supabase dashboard) and creates the auth identity
    // if it doesn't exist yet.
    const { error } = await getSupabaseAdmin().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      console.error('supabase signInWithOtp (registration) failed', error);
      return NextResponse.json({ error: 'Could not send verification code. Try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Verification code sent' });
  } catch (err) {
    console.error('registration request-otp failed', err);
    return NextResponse.json({ error: 'Could not send verification code. Try again.' }, { status: 500 });
  }
}
