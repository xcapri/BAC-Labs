import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// VULNERABILITY: Using a weak/common secret for educational purposes
// This makes JWT vulnerable to brute-force attacks
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'secret'
);

export interface JWTPayload {
  userId: number;
  username: string;
  role: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as unknown as JWTPayload;
  } catch (err) {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  return await verifyToken(token);
}

export async function requireAuth(): Promise<JWTPayload> {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}

export async function requireAdmin(): Promise<JWTPayload> {
  const session = await requireAuth();

  if (session.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return session;
}
