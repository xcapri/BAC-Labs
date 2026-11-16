import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { User } from '@/types';

/**
 * SKENARIO 0.1 - BAC CSR (Client-Side Rendering Vulnerability)
 *
 * VULNERABILITY: No server-side authorization check!
 * - API ini tidak memvalidasi apakah user adalah admin
 * - Bergantung pada client-side check (via /api/v0.1/permissions/check)
 * - Jika client bypass permission check, API ini akan memberikan data
 */

export async function GET() {
  try {
    // Check if user is logged in
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // VULNERABILITY: Not checking authorization!
    // In a proper implementation, should check if user is admin here
    // This API relies on client-side permission check which can be bypassed

    // Fetch all users from database
    const users = db.prepare(`
      SELECT id, uuid, username, role, created_at
      FROM users
      ORDER BY created_at DESC
    `).all() as User[];

    return NextResponse.json({
      users,
      vulnerability: 'CSR - No server-side authorization, relies on client check',
      scenario: '0.1'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
