import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/**
 * SKENARIO 0.1 - BAC CSR (Client-Side Rendering Vulnerability)
 *
 * VULNERABILITY: Client-side authorization check!
 * - API ini mengembalikan informasi permission
 * - Client (browser) yang memutuskan apakah user bisa akses atau tidak
 * - Response bisa dimanipulasi via DevTools
 */

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // VULNERABILITY: Returning permission info to client
    // Client will make authorization decision based on this response
    // This can be manipulated!
    return NextResponse.json({
      role: session.role,
      canAccessUsers: session.role === 'admin',
      canApprove: session.role === 'admin',
      vulnerability: 'CSR - Client-side authorization decision',
      scenario: '0.1',
      message: 'Client decides access based on this response - can be manipulated!'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
