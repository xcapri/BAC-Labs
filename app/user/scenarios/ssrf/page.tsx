'use client';

import { useState } from 'react';
import Link from 'next/link';
import UserNav from '@/components/UserNav';

export default function SSRFPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<{ status: number; body: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/ssrf/fetch?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (res.ok) {
        setResult({ status: data.status, body: data.body });
      } else {
        setError(data.error || 'Gagal fetch URL');
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
              Skenario SSRF: Server-Side Request Forgery
            </h3>
            <div className="text-red-700 space-y-2">
              <p><strong>Vulnerability:</strong> Server mengambil URL dari user tanpa memvalidasi scheme/host.</p>
              <p><strong>Risk:</strong> Attacker memaksa server melakukan request ke resource internal (localhost, metadata cloud, service lain) yang tidak bisa diakses langsung dari luar.</p>
            </div>
          </div>

          {/* Learning Guide */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">🎓 Cara Exploit (Hanya untuk Tujuan Edukasi)</h3>
            <div className="text-blue-700 space-y-3">
              <div>
                <p className="font-semibold text-sm">1. Akses internal service (endpoint ini hanya balas ke Host 127.0.0.1):</p>
                <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm mt-2 overflow-x-auto">
{`http://127.0.0.1:3000/api/internal/secret`}
                </code>
              </div>
              <div>
                <p className="font-semibold text-sm">2. Analogi dunia nyata (cloud metadata, tidak akan resolve di lab lokal):</p>
                <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm mt-2 overflow-x-auto">
{`http://169.254.169.254/latest/meta-data/`}
                </code>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Demo SSRF</h1>
            <Link href="/user/dashboard" className="btn-secondary">
              ← Kembali ke Dashboard
            </Link>
          </div>

          {/* Fetch form */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Fetch URL (dari server)</h2>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="http://127.0.0.1:3000/api/internal/secret"
                required
              />
              <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
                {loading ? 'Fetching...' : 'Fetch'}
              </button>
            </form>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Response (status {result.status})</h2>
              <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap">
                {result.body}
              </pre>
            </div>
          )}

          {/* How to Fix */}
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mt-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">🔒 Cara Memperbaiki Vulnerability Ini</h3>
            <div className="text-green-700 space-y-2">
              <p><strong>1. Allowlist:</strong> hanya izinkan domain/host yang jelas (mis. hanya API partner tertentu).</p>
              <p><strong>2. Blokir scheme internal:</strong> tolak <code>file://</code>, IP private, loopback, dan link-local (169.254.x.x).</p>
              <p><strong>3. Pisahkan network:</strong> jangan biarkan app server bebas mengakses service internal.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
