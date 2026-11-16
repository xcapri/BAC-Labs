'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserNav from '@/components/UserNav';

export default function ATO1ScenarioPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    newPassword: ''
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch current user info
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          setFormData(prev => ({
            ...prev,
            id: data.user.id.toString(),
            username: data.user.username
          }));
        }
      })
      .catch(err => console.error('Error fetching user:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/ato-1/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: parseInt(formData.id),
          username: formData.username,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Password berhasil diubah untuk user ID: ${data.userId}`);
        setFormData(prev => ({ ...prev, newPassword: '' }));
      } else {
        setError(data.error || 'Gagal mengubah password');
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
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Skenario ATO-1: Account Takeover via Enumerable ID
                </h3>
                <div className="text-red-700 space-y-2">
                  <p><strong>Vulnerability:</strong> Endpoint ganti password menerima user ID tanpa pengecekan authorization yang proper.</p>
                  <p><strong>Risk:</strong> Attacker dapat mencoba user ID secara berurutan (1, 2, 3, ...) dan mengganti password akun manapun.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Guide */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">🎓 Cara Exploit (Hanya untuk Tujuan Edukasi)</h3>
            <div className="text-blue-700 space-y-3">
              <div>
                <p className="font-semibold">Step 1: Identifikasi Pola ID</p>
                <p className="text-sm">Perhatikan bahwa user ID menggunakan integer berurutan (1, 2, 3, ...)</p>
              </div>
              <div>
                <p className="font-semibold">Step 2: Enumerate User ID</p>
                <p className="text-sm">Coba berbagai nilai ID untuk menemukan user yang valid. ID yang umum:</p>
                <ul className="list-disc ml-6 text-sm">
                  <li>ID 1: Biasanya akun admin</li>
                  <li>ID 2: Biasanya user pertama</li>
                  <li>Coba ID 1-10 untuk menemukan akun aktif</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Step 3: Exploit Menggunakan API</p>
                <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm mt-2 overflow-x-auto">
{`curl -X POST http://localhost:3003/api/ato-1/change-password \\
  -H "Content-Type: application/json" \\
  -d '{"id": 1, "username": "admin", "newPassword": "hacked123"}'`}
                </code>
              </div>
              <div>
                <p className="font-semibold">Step 4: Verifikasi Takeover</p>
                <p className="text-sm">Coba login dengan password baru yang Anda set</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Demo Account Takeover via Enumerable ID</h1>
            <Link href="/user/dashboard" className="btn-secondary">
              ← Kembali ke Dashboard
            </Link>
          </div>

          {/* Current User Info */}
          {currentUser && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3">Informasi Akun Anda</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">User ID:</span>
                  <span className="ml-2 font-mono font-semibold">{currentUser.id}</span>
                </div>
                <div>
                  <span className="text-gray-600">Username:</span>
                  <span className="ml-2 font-semibold">{currentUser.username}</span>
                </div>
                <div>
                  <span className="text-gray-600">Role:</span>
                  <span className="ml-2 font-semibold capitalize">{currentUser.role}</span>
                </div>
              </div>
            </div>
          )}

          {/* Change Password Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Ganti Password</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan user ID (misal: 1, 2, 3)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Coba ubah ke nilai lain seperti 1 (admin) atau 2 (user lain)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan username"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Username umum: admin, user
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan password baru"
                  required
                  minLength={6}
                />
              </div>

              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  {message}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Mengubah Password...' : 'Ganti Password'}
              </button>
            </form>
          </div>

          {/* How to Fix */}
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mt-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">🔒 Cara Memperbaiki Vulnerability Ini</h3>
            <div className="text-green-700 space-y-2">
              <p><strong>1. Require Authentication:</strong> Verifikasi bahwa user sudah login</p>
              <p><strong>2. Implement Authorization:</strong> Pastikan user yang login hanya bisa mengubah password MILIKNYA SENDIRI</p>
              <p><strong>3. Require Current Password:</strong> Minta password saat ini sebelum mengizinkan perubahan</p>
              <p><strong>4. Use Session Data:</strong> Ambil user ID dari session yang ter-autentikasi, bukan dari request body</p>
              <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm mt-2">
{`// Versi yang aman
const session = await requireAuth();
if (session.userId !== requestedUserId) {
  throw new Error('Unauthorized');
}`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
