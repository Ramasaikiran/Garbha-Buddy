import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'companion') {
    return NextResponse.json({ error: 'Not logged in as a companion' }, { status: 401 });
  }

  const result = await db.query(
    `SELECT u.name, cm.city, cm.tier, cm.preference, cm.slug, cm.video_proof_url,
            cm.profile_photo_url, cm.bio, u.is_verified
     FROM companions_meta cm
     JOIN users u ON u.id = cm.id
     WHERE cm.id = $1`,
    [session.userId]
  );
  if (!result.rows[0]) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({ profile: result.rows[0] });
}

function isValidUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value) return true; // optional field
  try {
    const u = new URL(value.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'companion') {
    return NextResponse.json({ error: 'Not logged in as a companion' }, { status: 401 });
  }

  try {
    const { bio, profilePhotoUrl } = await request.json();

    if (typeof bio === 'string' && bio.length > 500) {
      return NextResponse.json({ error: 'Bio must be under 500 characters' }, { status: 400 });
    }
    if (!isValidUrl(profilePhotoUrl)) {
      return NextResponse.json(
        { error: 'Profile photo must be a link starting with http:// or https://' },
        { status: 400 }
      );
    }

    await db.query(
      `UPDATE companions_meta SET bio = $1, profile_photo_url = $2 WHERE id = $3`,
      [bio || null, profilePhotoUrl || null, session.userId]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('companion profile update failed', err);
    return NextResponse.json({ error: 'Could not update profile. Try again.' }, { status: 500 });
  }
}
