import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

// VULNERABLE ENDPOINT for Skenario 0.1
// This endpoint returns user permissions, but the response can be manipulated
// by the client before making decisions
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // VULNERABILITY: Returning role information that client will use
    // for authorization decisions (client-side authorization)
    return NextResponse.json({
      role: session.role,
      canAccessUsers: session.role === 'admin',
      canApprove: session.role === 'admin',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
