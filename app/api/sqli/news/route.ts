import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// SQL Injection lab. Input `search` langsung di-concat ke query SQL (tidak
// pakai parameterized query), sehingga attacker bisa mengubah struktur query.

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const search = request.nextUrl.searchParams.get('search') || '';

    // VULNERABLE: user input digabung langsung ke string SQL.
    const query = `SELECT id, title, content FROM news WHERE title LIKE '%${search}%' ORDER BY id DESC`;

    let news: any[] = [];
    let queryError: string | null = null;
    try {
      news = db.prepare(query).all() as any[];
    } catch (e: any) {
      queryError = e.message;
    }

    // debug_query disengaja dikembalikan untuk pembelajaran (lihat query aslinya)
    return NextResponse.json({ news, debug_query: query, queryError });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
