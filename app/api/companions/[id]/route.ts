import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseAvailabilityDates, todayIST } from '@/lib/availability';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const result = await db.query(
    `SELECT u.id, u.name, u.is_verified, cm.preference, cm.tier, cm.availability_dates
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
  const { availability_dates, ...companion } = result.rows[0];
  const today = todayIST();
  const availableDates = parseAvailabilityDates(availability_dates).filter((d) => d >= today);
  return NextResponse.json({ companion: { ...companion, availableDates } });
}
