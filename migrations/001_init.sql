-- 001_init.sql
-- Base schema for Garba-Buddy, reconstructed from application code and
-- the later migrations that ALTER these tables. This was originally
-- applied by hand in the Supabase SQL editor and never committed — this
-- file makes the repo self-contained so the DB can be rebuilt from
-- scratch (e.g. on a new Supabase project).
--
-- IMPORTANT: only includes columns that existed BEFORE 002-008 ran.
-- Those files ADD COLUMN on top of this — apply all migrations in
-- order (001 through the highest number) on a fresh database.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- One row per person: clients and companions share this table,
-- distinguished by `role`. Companions also get a row in companions_meta.
-- email + uniqueness on email/phone_number are added in 008_email_auth.sql.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('female', 'male', 'other')),
    phone_number VARCHAR(15) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('client', 'companion')),

    -- Companion approval gate (admin reviews video + ID before this flips true)
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- aadhaar_front_url, aadhaar_back_url, aadhaar_last4, selfie_url,
-- identity_verified are added in 007_identity_verification.sql.

-- Companion-only metadata. One row per companion, id shared with users.id.
-- slug is added in 002_companion_slug.sql.
-- razorpayx_fund_account_id is added in 004_companion_payout_account.sql.
CREATE TABLE companions_meta (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    city VARCHAR(60) NOT NULL,
    tier VARCHAR(10) NOT NULL DEFAULT 'gold' CHECK (tier IN ('gold', 'silver', 'diamond')),
    video_proof_url TEXT NOT NULL,
    preference VARCHAR(20) NOT NULL DEFAULT 'everyone' CHECK (preference IN ('everyone', 'girls_only')),
    availability_dates TEXT, -- comma-separated YYYY-MM-DD (client now sends an array; see 005+ app code)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- A client booking a companion for a specific Navratri date.
-- ticket_liability_accepted, razorpay_order_id, razorpay_payment_id
-- are added in 003_booking_payment_fields.sql.
-- companion_mismatch_reported, mismatch_note are added in 007_identity_verification.sql.
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id),
    companion_id UUID NOT NULL REFERENCES users(id),
    amount_paid INTEGER NOT NULL, -- in rupees, matches TIER_AMOUNTS
    booking_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),

    -- Check-in flow: OTP the client gives the companion in person
    otp_code VARCHAR(6),

    -- Payout to companion after the event (via RazorpayX)
    payout_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (payout_status IN ('pending', 'escrow', 'paid_out', 'refunded', 'failed')),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_companion ON bookings(companion_id);
CREATE INDEX idx_bookings_status ON bookings(status);
