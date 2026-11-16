import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// SSRF lab. Server mengambil URL yang diberikan user tanpa validasi scheme/host,
// sehingga bisa dipakai untuk membaca resource internal (localhost, metadata, dsb).

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const url = request.nextUrl.searchParams.get('url') || '';
    if (!url) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // VULNERABLE: fetch ke URL arbitrary dari sisi server, tanpa allowlist.
    const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
    const body = await res.text();

    return NextResponse.json({ status: res.status, body });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
