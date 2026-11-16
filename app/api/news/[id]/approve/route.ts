import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { News } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const session = await requireAdmin();

    // Get id from params
    const { id } = await params;
    const newsId = parseInt(id);

    if (isNaN(newsId)) {
      return NextResponse.json(
        { error: 'Invalid news ID' },
        { status: 400 }
      );
    }

    // Check if news exists
    const news = db.prepare('SELECT * FROM news WHERE id = ?').get(newsId) as News | undefined;

    if (!news) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }

    // Update approval status
    const result = db.prepare(`
      UPDATE news
      SET approved_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(session.userId, newsId);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Failed to approve news' },
        { status: 500 }
      );
    }

    // Fetch updated news with joins
    const updatedNews = db.prepare(`
      SELECT n.*,
             u1.username as author_username,
             u1.uuid as author_uuid,
             u2.username as approver_username,
             u2.uuid as approver_uuid
      FROM news n
      LEFT JOIN users u1 ON n.author_id = u1.id
      LEFT JOIN users u2 ON n.approved_by = u2.id
      WHERE n.id = ?
    `).get(newsId);

    return NextResponse.json({
      success: true,
      news: updatedNews
    });
  } catch (error: any) {
    console.error('Error approving news:', error);

    if (error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Access denied. Admin only.' },
        { status: 403 }
      );
    }

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
