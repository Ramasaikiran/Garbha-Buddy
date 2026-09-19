import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_session';

function secretKey() {
  return new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET);
}

export async function createAdminSession(admin: { id: string; email: string }) {
  const token = await new SignJWT({ role: 'admin', adminId: admin.id, email: admin.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('12h')
    .sign(secretKey());
  return { name: COOKIE_NAME, value: token };
}

export async function isAdminRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  try {
    await jwtVerify(match[1], secretKey());
    return true;
  } catch {
    return false;
  }
}

export async function isAdminPage() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey());
    return true;
  } catch {
    return false;
  }
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
