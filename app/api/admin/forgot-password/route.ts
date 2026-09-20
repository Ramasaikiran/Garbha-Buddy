import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Only send a reset if this email is actually a designated admin —
    // but don't reveal which emails are/aren't admins to a caller.
    const admin = await db.query('SELECT id FROM admin_users WHERE email = $1', [email]);
    if (!admin.rows[0]) {
      return NextResponse.json({ success: true }); // same response either way
    }

    const { error } = await getSupabaseAdmin().auth.resetPasswordForEmail(email);
    if (error) {
      console.error('admin forgot-password: resetPasswordForEmail failed', error);
      return NextResponse.json({ error: 'Could not send reset code. Try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('admin forgot-password failed', err);
    return NextResponse.json({ error: 'Could not send reset code. Try again.' }, { status: 500 });
  }
}
