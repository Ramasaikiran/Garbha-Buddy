import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();
    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const admin = await db.query('SELECT id FROM admin_users WHERE email = $1', [email]);
    if (!admin.rows[0]) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery',
    });

    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(data.user.id, {
      password: newPassword,
    });

    if (updateError) {
      console.error('admin reset-password: updateUserById failed', updateError);
      return NextResponse.json({ error: 'Could not update password. Try again.' }, { status: 500 });
    }

    // Keep admin_users linked, in case this admin was created before auth_user_id existed.
    await db.query(
      'UPDATE admin_users SET auth_user_id = $1 WHERE email = $2 AND auth_user_id IS NULL',
      [data.user.id, email]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('admin reset-password failed', err);
    return NextResponse.json({ error: 'Could not reset password. Try again.' }, { status: 500 });
  }
}
