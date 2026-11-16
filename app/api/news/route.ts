import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { News } from '@/types';

export async function GET() {
  try {
    const session = await requireAuth();

    let query = `
      SELECT n.*,
             u1.username as author_username,
             u1.uuid as author_uuid,
             u2.username as approver_username,
             u2.uuid as approver_uuid
      FROM news n
      LEFT JOIN users u1 ON n.author_id = u1.id
      LEFT JOIN users u2 ON n.approved_by = u2.id
    `;

    // If user is not admin, only show their own news or approved news
    if (session.role !== 'admin') {
      query += ` WHERE n.author_id = ? OR n.approved_by IS NOT NULL`;
    }

    query += ` ORDER BY n.created_at DESC`;

    const news = session.role === 'admin'
      ? db.prepare(query).all() as News[]
      : db.prepare(query).all(session.userId) as News[];

    return NextResponse.json({ news });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { title, content, image_url } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const result = db.prepare(`
      INSERT INTO news (title, content, image_url, author_id)
      VALUES (?, ?, ?, ?)
    `).run(title, content, image_url || null, session.userId);

    const newNews = db.prepare(`
      SELECT n.*,
             u.username as author_username,
             u.uuid as author_uuid
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      WHERE n.id = ?
    `).get(result.lastInsertRowid) as News;

    return NextResponse.json({ news: newNews }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
