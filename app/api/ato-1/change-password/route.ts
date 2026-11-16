import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * SCENARIO ATO-1: Account Takeover via Enumerable ID
 *
 * VULNERABILITY: This endpoint accepts user ID as a parameter without proper authorization.
 * An attacker can enumerate IDs (1, 2, 3, ...) and change passwords for any user.
 *
 * EXPLOITATION:
 * POST /api/ato-1/change-password
 * Body: { "id": 1, "username": "admin", "newPassword": "hacked123" }
 *
 * The endpoint only checks if the user exists but doesn't verify if the requester
 * owns that account.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, username, newPassword } = body;

    // Validation
    if (!id || !username || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields: id, username, newPassword' },
        { status: 400 }
      );
    }

    // VULNERABILITY: No authentication check!
    // VULNERABILITY: No authorization check - not verifying if requester owns this account!

    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE id = ? AND username = ?').get(id, username);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update password
    const result = db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
      userId: id,
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
