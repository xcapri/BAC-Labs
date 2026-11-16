import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { News } from '@/types';

export async function GET() {
  try {
    // Get top 5 approved news
    const news = db.prepare(`
      SELECT n.*, u.username as author_username
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      WHERE n.approved_by IS NOT NULL
      ORDER BY n.created_at DESC
      LIMIT 5
    `).all() as News[];

    return NextResponse.json({ news });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
