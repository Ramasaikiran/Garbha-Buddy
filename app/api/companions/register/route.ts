import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateCompanionSlug } from '@/lib/slug';

export async function POST(request: Request) {
  try {
    const {
      name,
      gender,
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
    } = await request.json();

    if (
      !name ||
      !gender ||
      !phoneNumber ||
      !city ||
      !videoProofUrl ||
      !aadhaarFrontUrl ||
      !aadhaarBackUrl ||
      !selfieUrl
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create base user row with identity documents
    const userResult = await db.query(
      `INSERT INTO users
        (name, gender, phone_number, role, aadhaar_front_url, aadhaar_back_url, aadhaar_last4, selfie_url)
       VALUES ($1, $2, $3, 'companion', $4, $5, $6, $7)
       RETURNING id`,
      [name, gender, phoneNumber, aadhaarFrontUrl, aadhaarBackUrl, aadhaarLast4 || null, selfieUrl]
    );
    const companionId = userResult.rows[0].id;

    // 2. Generate a unique, shareable slug (retry on rare collision)
    let slug = generateCompanionSlug(name, city);
    for (let attempt = 0; attempt < 3; attempt++) {
      const existing = await db.query(
        'SELECT 1 FROM companions_meta WHERE slug = $1',
        [slug]
      );
      if (existing.rows.length === 0) break;
      slug = generateCompanionSlug(name, city);
    }

    // 3. Insert companion metadata
    await db.query(
      `INSERT INTO companions_meta
        (id, city, tier, video_proof_url, preference, availability_dates, slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        companionId,
        city,
        tier || 'gold',
        videoProofUrl,
        preference || 'everyone',
        availabilityDates,
        slug,
      ]
    );

    const shareableLink = `${process.env.NEXT_PUBLIC_BASE_URL}/book/${slug}`;

    return NextResponse.json({
      success: true,
      companionId,
      slug,
      shareableLink,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
