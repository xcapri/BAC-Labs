import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// Stored XSS lab: notes board. Content disimpan apa adanya dan di-render tanpa
// escaping di client, sehingga payload HTML/JS user lain tereksekusi di browser
// semua orang yang membuka board ini.

export async function GET() {
  try {
    await requireAuth();
    const notes = db.prepare(`
      SELECT n.*, u.username as author_username
      FROM notes n
      LEFT JOIN users u ON n.author_id = u.id
      ORDER BY n.id DESC
    `).all();

    return NextResponse.json({ notes });
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
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // VULNERABLE: content user disimpan mentah tanpa sanitasi/escaping
    const result = db.prepare(
      'INSERT INTO notes (author_id, content) VALUES (?, ?)'
    ).run(session.userId, content);

    const note = db.prepare(`
      SELECT n.*, u.username as author_username
      FROM notes n
      LEFT JOIN users u ON n.author_id = u.id
      WHERE n.id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json({ note }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
