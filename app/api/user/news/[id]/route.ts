import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { News } from '@/types';

// GET - Fetch single news by ID (only if owned by current user)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const newsId = parseInt(id);

    const news = db
      .prepare(
        `SELECT n.*, u.username as author_username, a.username as approver_username
         FROM news n
         LEFT JOIN users u ON n.author_id = u.id
         LEFT JOIN users a ON n.approved_by = a.id
         WHERE n.id = ? AND n.author_id = ?`
      )
      .get(newsId, session.userId) as News;

    if (!news) {
      return NextResponse.json(
        { error: 'News not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ news });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch news' },
      { status: 401 }
    );
  }
}

// PUT - Update news (only if owned by current user)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const newsId = parseInt(id);
    const body = await request.json();

    const { title, content, image_url } = body;

    // Check if news exists and is owned by current user
    const existingNews = db
      .prepare('SELECT * FROM news WHERE id = ? AND author_id = ?')
      .get(newsId, session.userId);

    if (!existingNews) {
      return NextResponse.json(
        { error: 'News not found or access denied' },
        { status: 404 }
      );
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    db.prepare(
      `UPDATE news
       SET title = ?, content = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND author_id = ?`
    ).run(title, content, image_url || null, newsId, session.userId);

    const updatedNews = db
      .prepare(
        `SELECT n.*, u.username as author_username, a.username as approver_username
         FROM news n
         LEFT JOIN users u ON n.author_id = u.id
         LEFT JOIN users a ON n.approved_by = a.id
         WHERE n.id = ?`
      )
      .get(newsId) as News;

    return NextResponse.json({
      message: 'News updated successfully',
      news: updatedNews,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update news' },
      { status: 500 }
    );
  }
}

// DELETE - Delete news (only if owned by current user)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const newsId = parseInt(id);

    // Check if news exists and is owned by current user
    const existingNews = db
      .prepare('SELECT * FROM news WHERE id = ? AND author_id = ?')
      .get(newsId, session.userId);

    if (!existingNews) {
      return NextResponse.json(
        { error: 'News not found or access denied' },
        { status: 404 }
      );
    }

    db.prepare('DELETE FROM news WHERE id = ? AND author_id = ?').run(
      newsId,
      session.userId
    );

    return NextResponse.json({ message: 'News deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete news' },
      { status: 500 }
    );
  }
}
