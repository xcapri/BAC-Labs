import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { User } from '@/types';

/**
 * SKENARIO 1.1 - Forced Browsing (API Endpoint Vulnerability)
 *
 * VULNERABILITY: API endpoint not protected!
 * - Page /be/v1.1/users sudah protected dengan requireAdmin()
 * - Tapi API endpoint ini masih bisa diakses langsung
 * - User bisa bypass UI protection dengan direct API access
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
    // Page is protected, but API is not
    // Attacker can bypass page protection by accessing API directly

    // Fetch all users from database
    const users = db.prepare(`
      SELECT id, uuid, username, role, created_at
      FROM users
      ORDER BY created_at DESC
    `).all() as User[];

    return NextResponse.json({
      users,
      vulnerability: 'Forced Browsing - API not protected while page is',
      scenario: '1.1',
      message: 'Page /be/v1.1/users is protected, but this API endpoint is not!'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
