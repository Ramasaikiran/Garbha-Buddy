import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { db } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';

function secretMatches(given: unknown): boolean {
  const expected = process.env.ADMIN_SECRET;
  if (!expected || typeof given !== 'string') return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Email-free admin password reset, gated by ADMIN_SECRET.
// Sets the Supabase password and links admin_users.auth_user_id.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const newPassword = String(body.newPassword || '');

    if (!secretMatches(body.secret)) {
      return NextResponse.json({ error: 'Incorrect secret' }, { status: 401 });
    }
    if (!email || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Email and a password of at least 8 characters are required' },
        { status: 400 }
      );
    }

    const result = await db.query(
      'SELECT id, auth_user_id FROM admin_users WHERE LOWER(email) = $1',
      [email]
    );
    const admin = result.rows[0];
    if (!admin) {
      return NextResponse.json({ error: 'No admin account with that email' }, { status: 404 });
    }

    const supabase = getSupabaseAdmin();
    let authUserId: string | null = admin.auth_user_id;

    if (authUserId) {
      const { error } = await supabase.auth.admin.updateUserById(authUserId, {
        password: newPassword,
        email_confirm: true,
      });
      if (error) {
        console.error('admin secret-reset: updateUserById failed', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: newPassword,
        email_confirm: true,
      });
      if (data?.user) {
        authUserId = data.user.id;
      } else {
        // Supabase user may already exist without being linked. Find and update it.
        let found: string | null = null;
        for (let page = 1; page <= 20 && !found; page++) {
          const { data: list, error: listErr } = await supabase.auth.admin.listUsers({
            page,
            perPage: 200,
          });
          if (listErr || !list?.users.length) break;
          found = list.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
          if (list.users.length < 200) break;
        }
        if (!found) {
          console.error('admin secret-reset: createUser failed', error);
          return NextResponse.json({ error: error?.message || 'Could not create user' }, { status: 500 });
        }
        const { error: updErr } = await supabase.auth.admin.updateUserById(found, {
          password: newPassword,
          email_confirm: true,
        });
        if (updErr) {
          console.error('admin secret-reset: updateUserById failed', updErr);
          return NextResponse.json({ error: updErr.message }, { status: 500 });
        }
        authUserId = found;
      }
    }

    await db.query(
      'UPDATE admin_users SET auth_user_id = $1, password_hash = NULL WHERE id = $2',
      [authUserId, admin.id]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('admin secret-reset failed', err);
    return NextResponse.json({ error: 'Reset failed. Try again.' }, { status: 500 });
  }
}
