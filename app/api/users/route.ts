import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import db from '@/lib/db';
// import { requireAdmin } from '@/lib/auth'; // Commented out for BAC vulnerability demo
import { User } from '@/types';

// VULNERABLE: This endpoint can be accessed by anyone (for Skenario 1.1)
// In a secure implementation, this should check authentication
export async function GET() {
  try {
    // VULNERABILITY: No authentication check here!
    // This allows any authenticated user to access user list
    // Proper implementation should call: await requireAdmin();

    const users = db.prepare(`
      SELECT id, uuid, username, role, created_at
      FROM users
      ORDER BY created_at DESC
    `).all() as User[];

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * BROKEN ACCESS CONTROL VULNERABILITY
 *
 * VULNERABILITY: No authentication or authorization check!
 * - Endpoint ini bisa diakses tanpa login
 * - Attacker bisa mendaftar user baru (bahkan admin!) tanpa otorisasi
 * - Endpoint ini di-expose melalui browser debugger/network tab
 *
 * EXPLOIT SCENARIO:
 * - User membuka browser developer tools (F12)
 * - Melihat network request POST /api/users dengan payload
 * - Copy request sebagai cURL atau gunakan fetch() di console
 * - Membuat account admin baru tanpa autentikasi
 */
export async function POST(request: NextRequest) {
  try {
    // VULNERABILITY: NO AUTHENTICATION CHECK!
    // await requireAdmin(); // <-- This is commented out!

    // Parse request body and handle JSON parsing errors
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        {
          error: 'Invalid or empty request body',
          required: {
            username: 'string (required)',
            password: 'string (required)',
            role: 'string (required) - must be "admin" or "user"'
          }
        },
        { status: 400 }
      );
    }

    const { username, password, role } = body;

    // Collect missing fields
    const missingFields: string[] = [];
    if (!username) missingFields.push('username');
    if (!password) missingFields.push('password');
    if (!role) missingFields.push('role');

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          missing: missingFields,
          required: {
            username: 'string (required)',
            password: 'string (required)',
            role: 'string (required) - must be "admin" or "user"'
          }
        },
        { status: 400 }
      );
    }

    // VULNERABILITY: Allowing any role including 'admin'!
    if (role !== 'admin' && role !== 'user') {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const uuid = randomUUID();

    const result = db.prepare(`
      INSERT INTO users (uuid, username, password, role)
      VALUES (?, ?, ?, ?)
    `).run(uuid, username, hashedPassword, role);

    const newUser = db.prepare(`
      SELECT id, uuid, username, role, created_at
      FROM users WHERE id = ?
    `).get(result.lastInsertRowid) as User;

    return NextResponse.json({
      user: newUser,
      vulnerability: 'Broken Access Control - No authentication required!',
      exploit: 'This endpoint can be called without authentication to create admin users'
    }, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
