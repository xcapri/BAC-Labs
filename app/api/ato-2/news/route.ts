import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

/**
 * SCENARIO ATO-2: UUID Exposure in API Response
 *
 * This endpoint returns news with approved_by_uuid exposed.
 * Attackers can collect UUIDs from approved content and use them for ATO-2 attack.
 */

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get all approved news with UUID exposed
    const news = db.prepare(`
      SELECT n.*,
             u1.username as author_username,
             u2.username as approver_username,
             u2.uuid as approver_uuid
      FROM news n
      LEFT JOIN users u1 ON n.author_id = u1.id
      LEFT JOIN users u2 ON n.approved_by = u2.id
      WHERE n.approved_by IS NOT NULL
      ORDER BY n.created_at DESC
    `).all();

    return NextResponse.json({ news });

  } catch (error: any) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
