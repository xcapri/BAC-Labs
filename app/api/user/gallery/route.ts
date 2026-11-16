import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Galeri } from '@/types';

// GET - Fetch all gallery items by current user
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    // Get gallery items created by the current user only
    const gallery = db
      .prepare(
        `SELECT g.*, u.username as author_username, a.username as approver_username
         FROM galeri g
         LEFT JOIN users u ON g.author_id = u.id
         LEFT JOIN users a ON g.approved_by = a.id
         WHERE g.author_id = ?
         ORDER BY g.created_at DESC`
      )
      .all(session.userId) as Galeri[];

    return NextResponse.json({ gallery });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch gallery' },
      { status: 401 }
    );
  }
}

// POST - Create new gallery item
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const { title, description, image_url } = body;

    if (!title || !image_url) {
      return NextResponse.json(
        { error: 'Title and image URL are required' },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        `INSERT INTO galeri (title, description, image_url, author_id, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
      )
      .run(title, description || null, image_url, session.userId);

    const newGallery = db
      .prepare(
        `SELECT g.*, u.username as author_username
         FROM galeri g
         LEFT JOIN users u ON g.author_id = u.id
         WHERE g.id = ?`
      )
      .get(result.lastInsertRowid) as Galeri;

    return NextResponse.json({
      message: 'Gallery item created successfully',
      gallery: newGallery,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create gallery item' },
      { status: 500 }
    );
  }
}
