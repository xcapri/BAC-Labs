import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { Galeri } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    const session = await requireAdmin();

    // Get id from params
    const { id } = await params;
    const galeriId = parseInt(id);

    if (isNaN(galeriId)) {
      return NextResponse.json(
        { error: 'Invalid galeri ID' },
        { status: 400 }
      );
    }

    // Check if galeri exists
    const galeri = db.prepare('SELECT * FROM galeri WHERE id = ?').get(galeriId) as Galeri | undefined;

    if (!galeri) {
      return NextResponse.json(
        { error: 'Galeri not found' },
        { status: 404 }
      );
    }

    // Update approval status
    const result = db.prepare(`
      UPDATE galeri
      SET approved_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(session.userId, galeriId);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Failed to approve galeri' },
        { status: 500 }
      );
    }

    // Fetch updated galeri with joins
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
    `).get(galeriId);

    return NextResponse.json({
      success: true,
      galeri: updatedGaleri
    });
  } catch (error: any) {
    console.error('Error approving galeri:', error);

    if (error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Access denied. Admin only.' },
        { status: 403 }
      );
    }

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
