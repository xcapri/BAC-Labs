import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Galeri } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();

    const { id } = await params;
    const galeri = db.prepare(`
      SELECT g.*,
             u1.username as author_username,
             u1.uuid as author_uuid,
             u2.username as approver_username,
             u2.uuid as approver_uuid
      FROM galeri g
      LEFT JOIN users u1 ON g.author_id = u1.id
      LEFT JOIN users u2 ON g.approved_by = u2.id
      WHERE g.id = ?
    `).get(id) as Galeri | undefined;

    if (!galeri) {
      return NextResponse.json(
        { error: 'Galeri not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ galeri });
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
    const { title, description, image_url } = await request.json();

    const galeri = db.prepare('SELECT * FROM galeri WHERE id = ?').get(id) as Galeri | undefined;

    if (!galeri) {
      return NextResponse.json(
        { error: 'Galeri not found' },
        { status: 404 }
      );
    }

    // Check if user is author or admin
    if (session.role !== 'admin' && galeri.author_id !== session.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    db.prepare(`
      UPDATE galeri
      SET title = ?, description = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, description || null, image_url, id);

    const updatedGaleri = db.prepare(`
      SELECT g.*,
             u1.username as author_username,
             u1.uuid as author_uuid,
             u2.username as approver_username,
             u2.uuid as approver_uuid
      FROM galeri g
      LEFT JOIN users u1 ON g.author_id = u1.id
      LEFT JOIN users u2 ON g.approved_by = u2.id
      WHERE g.id = ?
    `).get(id) as Galeri;

    return NextResponse.json({ galeri: updatedGaleri });
  } catch (error: any) {
    console.error('Error updating galeri:', error);
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

    const galeri = db.prepare('SELECT * FROM galeri WHERE id = ?').get(id) as Galeri | undefined;

    if (!galeri) {
      return NextResponse.json(
        { error: 'Galeri not found' },
        { status: 404 }
      );
    }

    // Check if user is author or admin
    if (session.role !== 'admin' && galeri.author_id !== session.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    db.prepare('DELETE FROM galeri WHERE id = ?').run(id);

    return NextResponse.json({ message: 'Galeri deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting galeri:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
