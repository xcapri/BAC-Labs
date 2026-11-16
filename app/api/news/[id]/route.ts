import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { News } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;
    const news = db.prepare(`
      SELECT n.*,
             u1.username as author_username,
             u1.uuid as author_uuid,
             u2.username as approver_username,
             u2.uuid as approver_uuid
      FROM news n
      LEFT JOIN users u1 ON n.author_id = u1.id
      LEFT JOIN users u2 ON n.approved_by = u2.id
      WHERE n.id = ?
    `).get(id) as News | undefined;

    if (!news) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ news });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const { title, content, image_url } = await request.json();

    const news = db.prepare('SELECT * FROM news WHERE id = ?').get(id) as News | undefined;

    if (!news) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }

    // Check if user is author or admin
    if (session.role !== 'admin' && news.author_id !== session.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    db.prepare(`
      UPDATE news
      SET title = ?, content = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, content, image_url || null, id);

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
    `).get(id) as News;

    return NextResponse.json({ news: updatedNews });
  } catch (error: any) {
    console.error('Error updating news:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const news = db.prepare('SELECT * FROM news WHERE id = ?').get(id) as News | undefined;

    if (!news) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }

    // Check if user is author or admin
    if (session.role !== 'admin' && news.author_id !== session.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    db.prepare('DELETE FROM news WHERE id = ?').run(id);

    return NextResponse.json({ message: 'News deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
