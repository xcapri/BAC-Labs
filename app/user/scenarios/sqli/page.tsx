'use client';

import { useState } from 'react';
import Link from 'next/link';
import UserNav from '@/components/UserNav';

export default function SQLiPage() {
  const [search, setSearch] = useState('');
  const [news, setNews] = useState<any[]>([]);
  const [debugQuery, setDebugQuery] = useState('');
  const [queryError, setQueryError] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setQueryError(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/sqli/news?search=${encodeURIComponent(search)}`);
      const data = await res.json();

      if (res.ok) {
        setNews(data.news || []);
        setDebugQuery(data.debug_query || '');
        setQueryError(data.queryError || null);
      } else {
        setError(data.error || 'Gagal mengambil data');
      }
    } catch (err: any) {
      setError('Terjadi error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Vulnerability Info Card */}
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Skenario SQLI: SQL Injection
            </h3>
            <div className="text-red-700 space-y-2">
              <p><strong>Vulnerability:</strong> Parameter <code>search</code> langsung di-concat ke query SQL tanpa parameterized query.</p>
              <p><strong>Risk:</strong> Attacker mengubah struktur query untuk membaca data yang tidak seharusnya (mis. password hash semua user).</p>
              <p><strong>Catatan:</strong> better-sqlite3 tidak mendukung stacked query (<code>;</code>), tapi boolean-based dan UNION-based tetap bisa.</p>
            </div>
          </div>

          {/* Learning Guide */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">🎓 Cara Exploit (Hanya untuk Tujuan Edukasi)</h3>
            <div className="text-blue-700 space-y-3">
              <div>
                <p className="font-semibold text-sm">1. Break query (kembalikan semua row):</p>
                <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm mt-2 overflow-x-auto">
{`' OR '1'='1`}
                </code>
              </div>
              <div>
                <p className="font-semibold text-sm">2. UNION untuk dump username + password hash:</p>
                <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm mt-2 overflow-x-auto">
{`' UNION SELECT id, username, password FROM users--`}
                </code>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Demo SQL Injection</h1>
            <Link href="/user/dashboard" className="btn-secondary">
              ← Kembali ke Dashboard
            </Link>
          </div>

          {/* Search form */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Cari Judul Berita</h2>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Sample   |   Payload: ' OR '1'='1"
              />
              <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
                {loading ? 'Mencari...' : 'Cari'}
              </button>
            </form>
          </div>

          {/* Raw query */}
          {debugQuery && (
            <div className="bg-gray-900 rounded-lg p-4 mb-6 overflow-x-auto">
              <p className="text-xs text-gray-400 mb-1">SQL yang dijalankan (debug):</p>
              <code className="text-green-400 text-sm break-all">{debugQuery}</code>
            </div>
          )}

          {queryError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              <strong>SQL error:</strong> {queryError}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
          )}

          {/* Results */}
          {searched && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Hasil ({news.length})</h2>
              {news.length === 0 ? (
                <p className="text-gray-500">Tidak ada hasil.</p>
              ) : (
                <div className="space-y-4">
                  {news.map((n, i) => (
                    <div key={i} className="border rounded p-4">
                      <h3 className="font-bold mb-1">{n.title}</h3>
                      <p className="text-sm text-gray-600">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* How to Fix */}
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mt-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">🔒 Cara Memperbaiki Vulnerability Ini</h3>
            <div className="text-green-700 space-y-2">
              <p><strong>1. Parameterized query:</strong> pakai <code>?</code> placeholder, jangan concat string.</p>
              <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm mt-2">
{`db.prepare('SELECT id, title, content FROM news WHERE title LIKE ? ORDER BY id DESC')
  .all(\`%\${search}%\`)`}
              </code>
              <p><strong>2. Validate input:</strong> batasi karakter yang diperbolehkan untuk pencarian.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
