import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { User } from '@/types';

/**
 * SKENARIO 0.0 - BAC SSR (Server-Side Rendering Vulnerability)
 *
 * VULNERABILITY: No proper authorization check!
 * - Hanya check apakah user sudah login (authenticated)
 * - TIDAK check apakah user adalah admin (authorized)
 * - User biasa bisa akses data users
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

    // VULNERABILITY: Not checking if user is admin!
    // Should have: if (session.role !== 'admin') { return 403; }

    // Fetch all users from database
    const users = db.prepare(`
      SELECT id, uuid, username, role, created_at
      FROM users
      ORDER BY created_at DESC
    `).all() as User[];

    return NextResponse.json({
      users,
      vulnerability: 'SSR - No authorization check',
      scenario: '0.0'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
