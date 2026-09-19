import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateCompanionSlug } from '@/lib/slug';

function isValidUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    console.error('companion registration: could not parse request body', err);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const {
      name,
      gender,
      email,
      phoneNumber,
      city,
      tier,
      videoProofUrl,
      preference,
      availabilityDates,
      aadhaarFrontUrl,
      aadhaarBackUrl,
      aadhaarLast4,
      selfieUrl,
    } = body;

    if (!name || !gender || !email || !phoneNumber || !city) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dates = Array.isArray(availabilityDates) ? availabilityDates : [];
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
    for (const d of dates) {
      if (typeof d !== 'string' || !dateFormat.test(d) || Number.isNaN(Date.parse(d))) {
        return NextResponse.json(
          { error: 'Available dates must be valid dates in YYYY-MM-DD format' },
          { status: 400 }
        );
      }
    }

    const linkFields: Record<string, unknown> = {
      'Dance proof video': videoProofUrl,
      'Aadhaar front': aadhaarFrontUrl,
      'Aadhaar back': aadhaarBackUrl,
      Selfie: selfieUrl,
    };
    for (const [label, value] of Object.entries(linkFields)) {
      if (!value) {
        return NextResponse.json({ error: `${label} is required` }, { status: 400 });
      }
      if (!isValidUrl(value)) {
        return NextResponse.json(
          { error: `${label} must be a link starting with http:// or https:// — not plain text` },
          { status: 400 }
        );
      }
    }

    // Pre-check for a friendly duplicate message; the transaction's unique
    // constraint below is the real guarantee against races.
    const existingUser = await db.query(
      'SELECT id FROM users WHERE phone_number = $1 OR email = $2',
      [phoneNumber, email]
    );
    if (existingUser.rows[0]) {
      return NextResponse.json(
        { error: 'An account with this phone number or email already exists' },
        { status: 409 }
      );
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // 1. Create base user row with identity documents
      const userResult = await client.query(
        `INSERT INTO users
          (name, gender, email, phone_number, role, aadhaar_front_url, aadhaar_back_url, aadhaar_last4, selfie_url)
         VALUES ($1, $2, $3, $4, 'companion', $5, $6, $7, $8)
         RETURNING id`,
        [name, gender, email, phoneNumber, aadhaarFrontUrl, aadhaarBackUrl, aadhaarLast4 || null, selfieUrl]
      );
      const companionId = userResult.rows[0].id;

      // 2. Generate a unique, shareable slug (retry on rare collision)
      let slug = generateCompanionSlug(name, city);
      for (let attempt = 0; attempt < 3; attempt++) {
        const existing = await client.query(
          'SELECT 1 FROM companions_meta WHERE slug = $1',
          [slug]
        );
        if (existing.rows.length === 0) break;
        slug = generateCompanionSlug(name, city);
      }

      // 3. Insert companion metadata
      await client.query(
        `INSERT INTO companions_meta
          (id, city, tier, video_proof_url, preference, availability_dates, slug)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          companionId,
          city,
          tier || 'gold',
          videoProofUrl,
          preference || 'everyone',
          dates,
          slug,
        ]
      );

      await client.query('COMMIT');

      const shareableLink = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/book/${slug}`;

      return NextResponse.json({
        success: true,
        companionId,
        slug,
        shareableLink,
      });
    } catch (err: any) {
      await client.query('ROLLBACK');

      if (err.code === '23505') {
        return NextResponse.json(
          { error: 'An account with this phone number or email already exists. Try logging in instead.' },
          { status: 409 }
        );
      }

      console.error('companion registration failed', err);
      return NextResponse.json(
        { error: 'Registration failed. Please check your details and try again.' },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('companion registration failed unexpectedly', err);
    return NextResponse.json(
      { error: 'Something went wrong on our end. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
