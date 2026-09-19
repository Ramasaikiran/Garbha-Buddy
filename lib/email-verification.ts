import { SignJWT, jwtVerify } from 'jose';

function secretKey() {
  const secret = process.env.EMAIL_VERIFICATION_SECRET || process.env.SESSION_SECRET;
  return new TextEncoder().encode(secret);
}

export async function signEmailVerificationToken(email: string) {
  return new SignJWT({ email, purpose: 'signup_email_verified' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('20m')
    .sign(secretKey());
}

export async function verifyEmailVerificationToken(
  token: unknown,
  expectedEmail: string
): Promise<boolean> {
  if (typeof token !== 'string' || !token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return (
      payload.purpose === 'signup_email_verified' &&
      typeof payload.email === 'string' &&
      payload.email.toLowerCase() === expectedEmail.toLowerCase()
    );
  } catch {
    return false;
  }
}
