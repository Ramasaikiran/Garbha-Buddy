import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Don't reveal whether an account exists. Same response either way.
    const user = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (!user.rows[0]) {
      return NextResponse.json({ success: true });
    }

    const { error } = await getSupabaseAdmin().auth.resetPasswordForEmail(email);
    if (error) {
      console.error('forgot-password: resetPasswordForEmail failed', error);
      return NextResponse.json({ error: 'Could not send reset code. Try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('forgot-password failed', err);
    return NextResponse.json({ error: 'Could not send reset code. Try again.' }, { status: 500 });
  }
}
