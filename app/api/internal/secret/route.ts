import { NextRequest, NextResponse } from 'next/server';

// "Internal only" endpoint untuk lab SSRF. Hanya boleh diakses lewat request
// server-side ke 127.0.0.1 (Host: 127.0.0.1:3000), bukan langsung dari browser
// (Host: localhost:3000). Penyederhanaan — di dunia nyata ini adalah service
// internal yang hanya listen di loopback / network yang tidak di-route.

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || '';

  if (host !== '127.0.0.1:3000') {
    return NextResponse.json({ error: 'Internal service only' }, { status: 403 });
  }

  return NextResponse.json({
    flag: 'FLAG{ssrf_reached_internal_service}',
    service: 'internal-metadata',
    note: 'Hanya bisa dijangkau dari dalam server (SSRF). Analogi: cloud metadata 169.254.169.254.',
  });
}
