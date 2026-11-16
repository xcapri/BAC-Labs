import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Galeri } from '@/types';

// GET - Fetch single gallery item by ID (only if owned by current user)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const galleryId = parseInt(id);

    const gallery = db
      .prepare(
        `SELECT g.*, u.username as author_username, a.username as approver_username
         FROM galeri g
         LEFT JOIN users u ON g.author_id = u.id
         LEFT JOIN users a ON g.approved_by = a.id
         WHERE g.id = ? AND g.author_id = ?`
      )
      .get(galleryId, session.userId) as Galeri;

    if (!gallery) {
      return NextResponse.json(
        { error: 'Gallery item not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ gallery });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch gallery item' },
      { status: 401 }
    );
  }
}

// PUT - Update gallery item (only if owned by current user)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const galleryId = parseInt(id);
    const body = await request.json();

    const { title, description, image_url } = body;

    // Check if gallery item exists and is owned by current user
    const existingGallery = db
      .prepare('SELECT * FROM galeri WHERE id = ? AND author_id = ?')
      .get(galleryId, session.userId);

    if (!existingGallery) {
      return NextResponse.json(
        { error: 'Gallery item not found or access denied' },
        { status: 404 }
      );
    }

    if (!title || !image_url) {
      return NextResponse.json(
        { error: 'Title and image URL are required' },
        { status: 400 }
      );
    }

    db.prepare(
      `UPDATE galeri
       SET title = ?, description = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND author_id = ?`
    ).run(title, description || null, image_url, galleryId, session.userId);

    const updatedGallery = db
      .prepare(
        `SELECT g.*, u.username as author_username, a.username as approver_username
         FROM galeri g
         LEFT JOIN users u ON g.author_id = u.id
         LEFT JOIN users a ON g.approved_by = a.id
         WHERE g.id = ?`
      )
      .get(galleryId) as Galeri;

    return NextResponse.json({
      message: 'Gallery item updated successfully',
      gallery: updatedGallery,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update gallery item' },
      { status: 500 }
    );
  }
}

// DELETE - Delete gallery item (only if owned by current user)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const galleryId = parseInt(id);

    // Check if gallery item exists and is owned by current user
    const existingGallery = db
      .prepare('SELECT * FROM galeri WHERE id = ? AND author_id = ?')
      .get(galleryId, session.userId);

    if (!existingGallery) {
      return NextResponse.json(
        { error: 'Gallery item not found or access denied' },
        { status: 404 }
      );
    }

    db.prepare('DELETE FROM galeri WHERE id = ? AND author_id = ?').run(
      galleryId,
      session.userId
    );

    return NextResponse.json({ message: 'Gallery item deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete gallery item' },
      { status: 500 }
    );
  }
}
