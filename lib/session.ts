import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function getSession() {
  const token = cookies().get('session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.SESSION_SECRET)
    );
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}
