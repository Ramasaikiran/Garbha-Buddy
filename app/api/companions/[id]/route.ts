import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const result = await db.query(
    `SELECT u.id, u.name, u.is_verified, cm.preference, cm.tier
     FROM companions_meta cm
     JOIN users u ON u.id = cm.id
     WHERE u.id = $1`,
    [params.id]
  );
  if (!result.rows[0]) {
    return NextResponse.json({ error: 'Companion not found' }, { status: 404 });
  }
  if (!result.rows[0].is_verified) {
    return NextResponse.json({ error: 'This companion is not yet verified' }, { status: 404 });
  }
  return NextResponse.json({ companion: result.rows[0] });
}
