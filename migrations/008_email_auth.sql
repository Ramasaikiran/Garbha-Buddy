-- Add email for login, enforce one account per phone number and per email
ALTER TABLE users
  ADD COLUMN email VARCHAR(255);

ALTER TABLE users
  ADD CONSTRAINT users_email_unique UNIQUE (email);

ALTER TABLE users
  ADD CONSTRAINT users_phone_number_unique UNIQUE (phone_number);

CREATE TABLE login_email_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    consumed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_login_email_otps_email ON login_email_otps(email);
