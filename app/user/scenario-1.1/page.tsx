'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserNav from '@/components/UserNav';
import { User } from '@/types';

export default function Scenario11Page() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempted, setAttempted] = useState(false);

  const attemptDirectAPI = async () => {
    setLoading(true);
    setError('');
    setAttempted(true);

    try {
      // Try to access the API directly
      const response = await fetch('/api/v1.1/users');
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />
      <div className="container mx-auto px-4 py-8">
        {/* Vulnerability Warning Banner */}
        <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="text-3xl mr-4">🔓</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-yellow-800 mb-2">
                Skenario 1.1 - Forced Browsing (API Endpoint Vulnerability)
              </h2>
              <p className="text-yellow-700 mb-4">
                Endpoint halaman <code className="bg-yellow-200 px-2 py-1 rounded">/be/v1.1/users</code> sudah protected,
                tapi API endpoint masih vulnerable!
              </p>
              <div className="bg-white rounded p-4 mt-4">
                <p className="font-semibold text-gray-800 mb-2">Vulnerability Explanation:</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>
                    Server-side page <code className="bg-gray-200 px-2 py-1 rounded">/be/v1.1/users</code> sudah menggunakan proper authorization
                  </li>
                  <li>
                    Tapi API endpoint <code className="bg-gray-200 px-2 py-1 rounded">/api/v1.1/users</code> tidak memiliki authorization check
                  </li>
                  <li>
                    Attacker bisa langsung akses API endpoint untuk mendapatkan data sensitif
                  </li>
                  <li>
                    Ini adalah contoh "Forced Browsing" - mencoba akses resource yang tidak visible di UI
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Forced Browsing Demo</h1>
          <Link href="/user/dashboard" className="btn-secondary">
            ← Kembali ke Dashboard
          </Link>
        </div>

        {/* Test Page Access */}
        <div className="card mb-6">
          <h3 className="text-lg font-bold mb-4">1. Test Page Access (Protected)</h3>
          <p className="text-sm text-gray-600 mb-4">
            Coba akses halaman <code className="bg-gray-200 px-2 py-1 rounded">/be/v1.1/users</code>:
          </p>
          <Link href="/be/v1.1/users" className="btn-primary inline-block">
            Akses /be/v1.1/users (Page)
          </Link>
          <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded">
            <p className="text-sm text-green-800">
              ✓ <strong>Expected:</strong> Halaman akan redirect ke user dashboard karena sudah properly protected dengan <code className="bg-green-200 px-1 rounded">requireAdmin()</code>.
            </p>
          </div>
        </div>

        {/* Test API Access */}
        <div className="card mb-6">
          <h3 className="text-lg font-bold mb-4">2. Test API Access (Vulnerable)</h3>
          <p className="text-sm text-gray-600 mb-4">
            Coba akses API endpoint <code className="bg-gray-200 px-2 py-1 rounded">/api/v1.1/users</code> secara langsung:
          </p>
          <div className="flex gap-4 mb-4">
            <button
              onClick={attemptDirectAPI}
              disabled={loading}
              className="btn-danger"
            >
              {loading ? 'Loading...' : '🔓 Akses /api/v1.1/users (API)'}
            </button>
            <a
              href="/api/v1.1/users"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Buka di Tab Baru
            </a>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-300 rounded mb-4">
              <p className="text-sm text-red-800">❌ Error: {error}</p>
            </div>
          )}

          {attempted && !loading && !error && users.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-300 rounded">
              <p className="text-sm text-red-800 font-semibold mb-2">
                ⚠️ <strong>VULNERABILITY CONFIRMED!</strong> API endpoint berhasil diakses tanpa proper authorization!
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        {users.length > 0 && (
          <>
            <div className="card mb-6 bg-red-50 border-2 border-red-300">
              <h3 className="text-lg font-bold text-red-800 mb-2">
                🔓 Data Berhasil Diakses!
              </h3>
              <p className="text-sm text-red-700">
                Anda sebagai user biasa berhasil mengakses data users melalui API endpoint yang vulnerable.
              </p>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td className="font-semibold">{user.username}</td>
                      <td>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                      <td>
                        <span className="text-red-600 font-semibold">
                          🔓 Exposed via API!
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* How to Test */}
        <div className="card mt-8 bg-blue-50 border border-blue-300">
          <h3 className="text-lg font-bold text-blue-900 mb-3">🔍 Cara Test Vulnerability Ini:</h3>
          <div className="space-y-3">
            <div className="bg-white rounded p-3">
              <p className="text-sm font-semibold text-gray-800 mb-2">Method 1: Browser Direct Access</p>
              <p className="text-xs text-gray-700 mb-2">
                Buka URL <code className="bg-gray-200 px-1 rounded">http://localhost:3000/api/v1.1/users</code> di browser
              </p>
            </div>
            <div className="bg-white rounded p-3">
              <p className="text-sm font-semibold text-gray-800 mb-2">Method 2: Using Curl</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`curl http://localhost:3000/api/v1.1/users \\
  -H "Cookie: token=YOUR_TOKEN_HERE"`}
              </pre>
            </div>
            <div className="bg-white rounded p-3">
              <p className="text-sm font-semibold text-gray-800 mb-2">Method 3: Using Fetch in DevTools Console</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`fetch('/api/v1.1/users')
  .then(r => r.json())
  .then(d => console.log(d))`}
              </pre>
            </div>
          </div>
        </div>

        {/* Fix Instructions */}
        <div className="card mt-8 bg-green-50 border border-green-300">
          <h3 className="text-lg font-bold text-green-900 mb-3">🛠️ Cara Fix Vulnerability Ini:</h3>
          <div className="bg-white rounded p-4">
            <p className="text-sm text-gray-700 mb-3">
              Edit file <code className="bg-gray-200 px-2 py-1 rounded">/app/api/v1.1/users/route.ts</code>:
            </p>
            <p className="text-sm font-semibold text-red-800 mb-2">❌ Current (Vulnerable):</p>
            <pre className="bg-red-50 border border-red-300 p-3 rounded text-xs mb-4 overflow-x-auto">
{`export async function GET() {
  // VULNERABILITY: No authentication check here!
  const users = db.prepare('SELECT * FROM users').all();
  return NextResponse.json({ users });
}`}
            </pre>
            <p className="text-sm font-semibold text-green-800 mb-2">✓ Fixed (Secure):</p>
            <pre className="bg-green-50 border border-green-300 p-3 rounded text-xs overflow-x-auto">
{`export async function GET() {
  // Add proper authorization check
  const session = await requireAdmin();

  const users = db.prepare('SELECT * FROM users').all();
  return NextResponse.json({ users });
}`}
            </pre>
            <p className="text-xs text-gray-600 mt-3">
              <strong>Key Point:</strong> Setiap API endpoint yang mengembalikan data sensitif HARUS memiliki
              proper authorization check. Jangan bergantung pada client-side atau page-level protection saja!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
