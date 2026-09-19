import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    const result = await db.query(
      `SELECT u.id, u.name, cm.city, cm.tier, cm.slug, cm.video_proof_url
       FROM companions_meta cm
       JOIN users u ON u.id = cm.id
       WHERE u.is_verified = TRUE
         AND ($1::text IS NULL OR cm.city = $1)
       ORDER BY cm.created_at DESC
       LIMIT 50`,
      [city]
    );

    return NextResponse.json({ companions: result.rows });
  } catch (err) {
    console.error('companion search failed', err);
    return NextResponse.json({ error: 'Could not load companions' }, { status: 500 });
  }
}
