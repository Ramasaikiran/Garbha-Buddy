import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin-session';

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await db.query(
    `SELECT u.id, u.name, u.phone_number, u.aadhaar_front_url, u.aadhaar_back_url,
            u.aadhaar_last4, u.selfie_url, cm.city, cm.tier, cm.video_proof_url
     FROM companions_meta cm
     JOIN users u ON u.id = cm.id
     WHERE u.is_verified = FALSE
     ORDER BY cm.updated_at ASC`
  );

  return NextResponse.json({ pending: result.rows });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { companionId, approve } = await request.json();
  await db.query(
    'UPDATE users SET is_verified = $1, identity_verified = $1 WHERE id = $2',
    [!!approve, companionId]
  );

  return NextResponse.json({ success: true });
}
