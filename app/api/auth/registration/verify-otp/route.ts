import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { signEmailVerificationToken } from '@/lib/email-verification';

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
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    const verificationToken = await signEmailVerificationToken(email, data.user.id);
    return NextResponse.json({ success: true, verificationToken });
  } catch (err) {
    console.error('registration verify-otp failed', err);
    return NextResponse.json({ error: 'Could not verify code. Try again.' }, { status: 500 });
  }
}
