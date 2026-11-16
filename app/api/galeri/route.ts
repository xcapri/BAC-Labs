import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Galeri } from '@/types';

export async function GET() {
  try {
    const session = await requireAuth();

    let query = `
      SELECT g.*,
             u1.username as author_username,
             u1.uuid as author_uuid,
             u2.username as approver_username,
             u2.uuid as approver_uuid
      FROM galeri g
      LEFT JOIN users u1 ON g.author_id = u1.id
      LEFT JOIN users u2 ON g.approved_by = u2.id
    `;

    // If user is not admin, only show their own galeri or approved galeri
    if (session.role !== 'admin') {
      query += ` WHERE g.author_id = ? OR g.approved_by IS NOT NULL`;
    }

    query += ` ORDER BY g.created_at DESC`;

    const galeri = session.role === 'admin'
      ? db.prepare(query).all() as Galeri[]
      : db.prepare(query).all(session.userId) as Galeri[];

    return NextResponse.json({ galeri });
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
    const { title, description, image_url } = await request.json();

    if (!title || !image_url) {
      return NextResponse.json(
        { error: 'Title and image_url are required' },
        { status: 400 }
      );
    }

    const result = db.prepare(`
      INSERT INTO galeri (title, description, image_url, author_id)
      VALUES (?, ?, ?, ?)
    `).run(title, description || null, image_url, session.userId);

    const newGaleri = db.prepare(`
      SELECT g.*,
             u.username as author_username,
             u.uuid as author_uuid
      FROM galeri g
      LEFT JOIN users u ON g.author_id = u.id
      WHERE g.id = ?
    `).get(result.lastInsertRowid) as Galeri;

    return NextResponse.json({ galeri: newGaleri }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating galeri:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
