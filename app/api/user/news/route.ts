import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { News } from '@/types';

// GET - Fetch all news by current user
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Get news created by the current user only
    const news = db
      .prepare(
        `SELECT n.*, u.username as author_username, a.username as approver_username
         FROM news n
         LEFT JOIN users u ON n.author_id = u.id
         LEFT JOIN users a ON n.approved_by = a.id
         WHERE n.author_id = ?
         ORDER BY n.created_at DESC`
      )
      .all(session.userId) as News[];

    return NextResponse.json({ news });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch news' },
      { status: 401 }
    );
  }
}

// POST - Create new news
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const { title, content, image_url } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        `INSERT INTO news (title, content, image_url, author_id, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
      )
      .run(title, content, image_url || null, session.userId);

    const newNews = db
      .prepare(
        `SELECT n.*, u.username as author_username
         FROM news n
         LEFT JOIN users u ON n.author_id = u.id
         WHERE n.id = ?`
      )
      .get(result.lastInsertRowid) as News;

    return NextResponse.json({
      message: 'News created successfully',
      news: newNews,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create news' },
      { status: 500 }
    );
  }
}
