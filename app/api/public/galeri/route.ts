import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { Galeri } from '@/types';

export async function GET() {
  try {
    // Get all approved galeri for slider
    const galeri = db.prepare(`
      SELECT g.*, u.username as author_username
      FROM galeri g
      LEFT JOIN users u ON g.author_id = u.id
      WHERE g.approved_by IS NOT NULL
      ORDER BY g.created_at DESC
    `).all() as Galeri[];

    return NextResponse.json({ galeri });
  } catch (error) {
    console.error('Error fetching galeri:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
