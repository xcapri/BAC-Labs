import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * SCENARIO ATO-2: Account Takeover via Exposed UUID
 *
 * VULNERABILITY: Admin upgraded from integer ID to UUID for "security",
 * but the UUID is exposed in response data (approved_by_uuid in news/galeri).
 *
 * EXPLOITATION:
 * 1. User views approved news/galeri and finds approved_by_uuid in response
 * 2. User uses that UUID to change another user's password
 * POST /api/ato-2/change-password
 * Body: { "uuid": "abc-123-def-456", "username": "admin", "newPassword": "hacked123" }
 *
 * The endpoint uses UUID instead of integer ID, but still lacks proper authorization.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uuid, username, newPassword } = body;

    // Validation
    if (!uuid || !username || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields: uuid, username, newPassword' },
        { status: 400 }
      );
    }

    // VULNERABILITY: No authentication check!
    // VULNERABILITY: No authorization check - not verifying if requester owns this account!
    // Even though UUID is used instead of integer ID, the fundamental flaw remains:
    // The UUID is exposed in API responses (approved_by_uuid field)

    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE uuid = ? AND username = ?').get(uuid, username);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update password
    const result = db.prepare('UPDATE users SET password = ? WHERE uuid = ?').run(hashedPassword, uuid);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
      uuid: uuid,
      username: username
    });

  } catch (error: any) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
