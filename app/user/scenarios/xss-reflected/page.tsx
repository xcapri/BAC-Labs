import Link from 'next/link';
import UserNav from '@/components/UserNav';

// Reflected XSS (server component). Query `?q=...` direfleksikan ke HTML tanpa
// escaping lewat dangerouslySetInnerHTML.

export default async function ReflectedXSSPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Vulnerability Info Card */}
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Skenario XSS-R: Reflected Cross-Site Scripting
            </h3>
            <div className="text-red-700 space-y-2">
              <p><strong>Vulnerability:</strong> Nilai parameter <code>?q=</code> ditampilkan kembali ke halaman tanpa HTML escaping.</p>
              <p><strong>Risk:</strong> Attacker mengirim link berisi script, dan script itu jalan di browser korban saat link dibuka.</p>
            </div>
          </div>

          {/* Learning Guide */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">🎓 Cara Exploit (Hanya untuk Tujuan Edukasi)</h3>
            <div className="text-blue-700 space-y-3">
              <p className="text-sm">Coba buka URL dengan payload berikut di address bar:</p>
              <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm mt-2 overflow-x-auto break-all">
{`/user/scenarios/xss-reflected?q=<img src=x onerror=alert(document.domain)>`}
              </code>
              <p className="text-sm">Atau payload yang lebih "berguna" (baca data dari halaman ini):</p>
              <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm mt-2 overflow-x-auto break-all">
{`/user/scenarios/xss-reflected?q=<script>fetch('/api/auth/me').then(r=>r.json()).then(d=>alert(JSON.stringify(d)))</script>`}
              </code>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Demo Reflected XSS</h1>
            <Link href="/user/dashboard" className="btn-secondary">
              ← Kembali ke Dashboard
            </Link>
          </div>

          {/* Search form */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Cari</h2>
            <form method="get" className="flex gap-2">
              <input
                name="q"
                defaultValue={q}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan kata kunci..."
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Cari
              </button>
            </form>
          </div>

          {/* Reflection */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Hasil Pencarian</h2>
            <p className="text-sm text-gray-500 mb-3">Anda mencari:</p>
            {/* VULNERABLE: refleksi tanpa escaping */}
            <div
              className="border rounded p-4"
              dangerouslySetInnerHTML={{ __html: q || '<span class="text-gray-400">(kosong)</span>' }}
            />
          </div>

          {/* How to Fix */}
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mt-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">🔒 Cara Memperbaiki Vulnerability Ini</h3>
            <div className="text-green-700 space-y-2">
              <p><strong>1. Escape output:</strong> render sebagai teks biasa, bukan HTML.</p>
              <p><strong>2. Framework default:</strong> React sudah auto-escape <code>{'{value}'}</code> — jangan pakai <code>dangerouslySetInnerHTML</code> untuk input user.</p>
              <p><strong>3. Content Security Policy (CSP):</strong> batasi sumber script yang boleh jalan.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
