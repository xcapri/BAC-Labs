'use client';

import { useState } from 'react';
import Link from 'next/link';
import UserNav from '@/components/UserNav';

export default function CMDIPage() {
  const [host, setHost] = useState('');
  const [result, setResult] = useState<{
    command: string;
    stdout: string;
    stderr: string;
    exitCode: number;
  } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/cmdi/ping?host=${encodeURIComponent(host)}`);
      const data = await res.json();

      if (res.ok) {
        setResult({
          command: data.command,
          stdout: data.stdout,
          stderr: data.stderr,
          exitCode: data.exitCode,
        });
      } else {
        setError(data.error || 'Gagal menjalankan perintah');
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
              Skenario CMDI: Command Injection
            </h3>
            <div className="text-red-700 space-y-2">
              <p><strong>Vulnerability:</strong> Input <code>host</code> langsung masuk ke perintah shell (<code>ping -c 2 &lt;host&gt;</code>) tanpa validasi.</p>
              <p><strong>Risk:</strong> Attacker menyisipkan perintah tambahan dan mengeksekusinya di server dengan hak user aplikasi.</p>
              <p><strong>Aman untuk lab:</strong> perintah jalan di mesin Anda sendiri (localhost), sebagai user Anda — tidak menyentuh sistem lain.</p>
            </div>
          </div>

          {/* Learning Guide */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">🎓 Cara Exploit (Hanya untuk Tujuan Edukasi)</h3>
            <div className="text-blue-700 space-y-3">
              <div>
                <p className="font-semibold text-sm">1. Jalankan perintah tambahan setelah ping:</p>
                <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm mt-2 overflow-x-auto">
{`127.0.0.1; id`}
                </code>
              </div>
              <div>
                <p className="font-semibold text-sm">2. Baca file sistem:</p>
                <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm mt-2 overflow-x-auto">
{`127.0.0.1 && cat /etc/passwd`}
                </code>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Demo Command Injection</h1>
            <Link href="/user/dashboard" className="btn-secondary">
              ← Kembali ke Dashboard
            </Link>
          </div>

          {/* Ping form */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Ping Host</h2>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="127.0.0.1   |   payload: 127.0.0.1; id"
                required
              />
              <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
                {loading ? 'Menjalankan...' : 'Ping'}
              </button>
            </form>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Output (exit code {result.exitCode})</h2>
              <p className="text-xs text-gray-500 mb-2">Perintah yang dijalankan:</p>
              <code className="block bg-gray-800 text-yellow-300 p-3 rounded text-sm mb-4 overflow-x-auto">
                {result.command}
              </code>
              {result.stdout && (
                <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap mb-4">
                  {result.stdout}
                </pre>
              )}
              {result.stderr && (
                <pre className="bg-gray-900 text-red-400 p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap">
                  {result.stderr}
                </pre>
              )}
            </div>
          )}

          {/* How to Fix */}
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mt-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">🔒 Cara Memperbaiki Vulnerability Ini</h3>
            <div className="text-green-700 space-y-2">
              <p><strong>1. Hindari shell:</strong> pakai <code>execFile</code> dengan argumen array, bukan <code>exec</code> dengan string.</p>
              <p><strong>2. Allowlist input:</strong> validasi host hanya berupa IP/hostname yang valid (regex ketat).</p>
              <p><strong>3. Least privilege:</strong> jangan jalankan app dengan user yang punya akses luas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
