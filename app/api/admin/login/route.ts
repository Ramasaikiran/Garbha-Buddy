import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';
import { createAdminSession, ADMIN_COOKIE_NAME } from '@/lib/admin-session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password: string = body.password;
    const email: string = String(body.email || '').trim().toLowerCase();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const result = await db.query(
      'SELECT id, email, auth_user_id, password_hash FROM admin_users WHERE LOWER(email) = $1',
      [email]
    );
    const admin = result.rows[0];
    if (!admin) {
      console.error('admin login: no admin_users row for', email);
      return NextResponse.json({ error: 'Incorrect email or password [DEBUG: not in admin_users]' }, { status: 401 });
    }

    // Supabase verifies the credential itself.
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    let authenticated = !error && !!data.user;

    // Legacy admins were created before the Supabase migration. They have a
    // bcrypt hash in admin_users but no Supabase credential, so the check
    // above always fails for them. Verify the old hash, then migrate them.
    if (!authenticated && admin.password_hash) {
      const legacyOk = await bcrypt.compare(password, admin.password_hash);
      if (legacyOk) {
        let authUserId: string | null = admin.auth_user_id;
        if (authUserId) {
          const { error: updErr } = await supabase.auth.admin.updateUserById(authUserId, {
            password,
            email_confirm: true,
          });
          if (updErr) console.error('admin login: legacy password sync failed', updErr);
        } else {
          const { data: created, error: createErr } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });
          if (createErr || !created.user) {
            console.error('admin login: legacy migration createUser failed', createErr);
          } else {
            authUserId = created.user.id;
          }
        }
        if (authUserId) {
          await db.query(
            'UPDATE admin_users SET auth_user_id = $1, password_hash = NULL WHERE id = $2',
            [authUserId, admin.id]
          );
        }
        authenticated = true;
      }
    }

    if (!authenticated) {
      const why = `supabase: ${error?.message ?? 'n/a'}; legacy hash: ${admin.password_hash ? 'present, no match' : 'none'}; linked: ${admin.auth_user_id ? 'yes' : 'no'}`;
      console.error('admin login failed:', why);
      return NextResponse.json({ error: `Incorrect email or password [DEBUG: ${why}]` }, { status: 401 });
    }

    const session = await createAdminSession({ id: admin.id, email: admin.email });
    const res = NextResponse.json({ success: true });
    res.cookies.set(session.name, session.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 12, // 12h
    });
    return res;
  } catch (err) {
    console.error('admin login failed', err);
    return NextResponse.json({ error: 'Login failed. Try again.' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, '', { maxAge: 0 });
  return res;
}
