import { SignJWT, jwtVerify } from 'jose';

function secretKey() {
  const secret = process.env.EMAIL_VERIFICATION_SECRET || process.env.SESSION_SECRET;
  return new TextEncoder().encode(secret);
}

export async function signEmailVerificationToken(email: string, authUserId: string) {
  return new SignJWT({ email, authUserId, purpose: 'signup_email_verified' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('20m')
    .sign(secretKey());
}

export async function verifyEmailVerificationToken(
  token: unknown,
  expectedEmail: string
): Promise<{ valid: boolean; authUserId: string | null }> {
  if (typeof token !== 'string' || !token) return { valid: false, authUserId: null };
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const valid =
      payload.purpose === 'signup_email_verified' &&
      typeof payload.email === 'string' &&
      payload.email.toLowerCase() === expectedEmail.toLowerCase();
    return {
      valid,
      authUserId: valid && typeof payload.authUserId === 'string' ? payload.authUserId : null,
    };
  } catch {
    return { valid: false, authUserId: null };
  }
}
