'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import UserNav from '@/components/UserNav';

export default function StoredXSSPage() {
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadNotes = () => {
    fetch('/api/xss-stored/notes')
      .then((r) => r.json())
      .then((d) => setNotes(d.notes || []))
      .catch((e) => console.error('Error fetching notes:', e));
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/xss-stored/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Catatan berhasil disimpan');
        setContent('');
        loadNotes();
      } else {
        setError(data.error || 'Gagal menyimpan catatan');
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
              Skenario XSS-S: Stored Cross-Site Scripting
            </h3>
            <div className="text-red-700 space-y-2">
              <p><strong>Vulnerability:</strong> Isi catatan disimpan mentah di database dan di-render tanpa escaping di board yang dibaca semua user.</p>
              <p><strong>Risk:</strong> Payload tersimpan permanen dan tereksekusi di browser setiap orang (termasuk admin) yang membuka board ini.</p>
              <p><strong>Catatan:</strong> Cookie session <code>token</code> berflag <code>HttpOnly</code>, jadi <code>document.cookie</code> kosong — impact XSS di sini adalah bertindak/membaca data atas nama korban (mis. <code>fetch('/api/auth/me')</code>), bukan mencuri cookie.</p>
            </div>
          </div>

          {/* Learning Guide */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">🎓 Cara Exploit (Hanya untuk Tujuan Edukasi)</h3>
            <div className="text-blue-700 space-y-3">
              <p className="text-sm">Tulis payload berikut di kolom catatan, lalu buka ulang halaman:</p>
              <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm mt-2 overflow-x-auto break-all">
{`<img src=x onerror=fetch('/api/auth/me').then(r=>r.json()).then(d=>alert('Korban: '+d.user.username))>`}
              </code>
              <p className="text-sm">Setiap user lain yang membuka board ini akan mengeksekusi payload tersebut di browser-nya.</p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Demo Stored XSS (Papan Catatan)</h1>
            <Link href="/user/dashboard" className="btn-secondary">
              ← Kembali ke Dashboard
            </Link>
          </div>

          {/* Write note */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Tulis Catatan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tulis payload XSS di sini..."
                rows={3}
                required
              />
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{message}</div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Menyimpan...' : 'Simpan Catatan'}
              </button>
            </form>
          </div>

          {/* Shared board */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Semua Catatan (Shared Board)</h2>
            {notes.length === 0 ? (
              <p className="text-gray-500">Belum ada catatan.</p>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="border rounded p-4">
                    <div className="text-xs text-gray-500 mb-1">
                      #{note.id} — {note.author_username}
                    </div>
                    {/* VULNERABLE: render content tanpa escaping */}
                    <div dangerouslySetInnerHTML={{ __html: note.content }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* How to Fix */}
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mt-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">🔒 Cara Memperbaiki Vulnerability Ini</h3>
            <div className="text-green-700 space-y-2">
              <p><strong>1. Escape saat render:</strong> tampilkan sebagai teks (React default), jangan pakai <code>dangerouslySetInnerHTML</code>.</p>
              <p><strong>2. Sanitasi di server:</strong> bersihkan/validasi input sebelum disimpan (mis. DOMPurify di sisi yang sesuai).</p>
              <p><strong>3. CSP:</strong> Content Security Policy untuk membatasi eksekusi script inline.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
