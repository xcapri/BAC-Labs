'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserNav from '@/components/UserNav';
import { User } from '@/types';
import { useGuide } from '@/contexts/GuideContext';

export default function Scenario01Page() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [canAccessUsers, setCanAccessUsers] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const { showGuide } = useGuide();

  useEffect(() => {
    checkPermissions();
  }, []);

  // VULNERABILITY: Client-side authorization check!
  const checkPermissions = async () => {
    try {
      // First, check permissions via API
      const permResponse = await fetch('/api/v0.1/permissions/check');
      const permData = await permResponse.json();

      if (!permResponse.ok) {
        router.push('/login');
        return;
      }

      // VULNERABILITY: Making authorization decision based on API response
      // This can be manipulated via browser DevTools!
      if (permData.canAccessUsers) {
        setCanAccessUsers(true);
        // If permission check passes, fetch users
        await fetchUsers();
      } else {
        setCanAccessUsers(false);
      }

      setCheckingPermissions(false);
    } catch (err) {
      console.error('Permission check error:', err);
      setCheckingPermissions(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // VULNERABILITY: This API endpoint is also not properly protected
      const response = await fetch('/api/v0.1/users');
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (checkingPermissions) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNav />
        <div className="container mx-auto px-4 py-8">
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!canAccessUsers) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNav />
        <div className="container mx-auto px-4 py-8">
          {showGuide ? (
            <div className="bg-orange-100 border-2 border-orange-500 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <div className="text-3xl mr-4">🔓</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-orange-800 mb-2">
                    Skenario 0.1 - Broken Access Control (CSR)
                  </h2>
                  <p className="text-orange-700 mb-4">
                    Access Denied - Tapi ini vulnerability client-side!
                  </p>
                  <div className="bg-white rounded p-4 mt-4">
                    <p className="font-semibold text-gray-800 mb-2">🎯 Challenge:</p>
                    <p className="text-sm text-gray-700 mb-3">
                      Halaman ini menggunakan client-side authorization check. Validasi dilakukan di browser berdasarkan
                      response dari <code className="bg-gray-200 px-2 py-1 rounded">/api/v0.1/permissions/check</code>.
                    </p>
                    <p className="font-semibold text-gray-800 mb-2">💡 Cara Bypass:</p>
                    <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                      <li>Buka Browser DevTools (F12)</li>
                      <li>Pergi ke tab "Network"</li>
                      <li>Refresh halaman ini</li>
                      <li>Cari request ke <code className="bg-gray-200 px-1 rounded">/api/v0.1/permissions/check</code></li>
                      <li>Klik kanan → "Override content" atau gunakan browser extension untuk modify response</li>
                      <li>Ubah <code className="bg-gray-200 px-1 rounded">canAccessUsers: false</code> menjadi <code className="bg-green-200 px-1 rounded">canAccessUsers: true</code></li>
                      <li>Atau gunakan Console dan panggil: <code className="bg-gray-200 px-1 rounded">setCanAccessUsers(true); fetchUsers();</code></li>
                    </ol>
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm font-semibold text-red-800">⚠️ Vulnerability:</p>
                      <p className="text-xs text-red-700 mt-1">
                        Authorization check dilakukan di client-side (browser). Client memutuskan apakah user bisa akses atau tidak
                        berdasarkan response API. Response ini bisa dimanipulasi oleh attacker!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-100 border-2 border-red-500 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center">
                <div className="text-3xl mr-4">🚫</div>
                <div>
                  <h2 className="text-2xl font-bold text-red-800">Access Denied</h2>
                  <p className="text-red-700">You do not have permission to access this page.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <Link href="/user/dashboard" className="btn-secondary">
              ← Kembali ke Dashboard
            </Link>
            {showGuide && (
              <button
                onClick={() => {
                  // Easter egg: Allow bypass via button for demo purposes
                  setCanAccessUsers(true);
                  setLoading(true);
                  fetchUsers();
                }}
                className="btn-danger text-sm"
              >
                🔓 Quick Bypass (Demo)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />
      <div className="container mx-auto px-4 py-8">
        {/* Vulnerability Warning Banner - Only show with guide */}
        {showGuide && (
          <div className="bg-orange-100 border-2 border-orange-500 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="text-3xl mr-4">🔓</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-orange-800 mb-2">
                  Skenario 0.1 - Broken Access Control (CSR)
                </h2>
                <p className="text-orange-700 mb-4">
                  Anda berhasil bypass authorization check!
                </p>
                <div className="bg-white rounded p-4 mt-4">
                  <p className="font-semibold text-gray-800 mb-2">Vulnerability Explanation:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>
                      Authorization check dilakukan di <strong>client-side</strong> (browser)
                    </li>
                    <li>
                      Aplikasi menggunakan <code className="bg-gray-200 px-2 py-1 rounded">/api/v0.1/permissions/check</code> untuk menentukan akses
                    </li>
                    <li>
                      Response dari API digunakan untuk menampilkan/menyembunyikan konten
                    </li>
                    <li>
                      Attacker bisa manipulasi response atau bypass JavaScript logic
                    </li>
                    <li>
                      API endpoint <code className="bg-gray-200 px-2 py-1 rounded">/api/v0.1/users</code> juga tidak properly protected!
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{showGuide ? 'User Management (BYPASSED!)' : 'User Management'}</h1>
          <Link href="/user/dashboard" className="btn-secondary">
            ← Kembali ke Dashboard
          </Link>
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <>
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
                        {showGuide ? (
                          <span className="text-orange-600 font-semibold">
                            🔓 Bypassed!
                          </span>
                        ) : (
                          <span className="text-green-600 font-semibold">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showGuide && (
              <div className="card mt-8 bg-blue-50 border border-blue-300">
                <h3 className="text-lg font-bold text-blue-900 mb-3">🛠️ Cara Fix Vulnerability Ini:</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded p-4">
                    <p className="text-sm font-semibold text-gray-800 mb-2">1. Server-Side Authorization:</p>
                    <pre className="bg-green-50 border border-green-300 p-3 rounded text-xs overflow-x-auto">
{`// Di API endpoint /api/v0.1/users/route.ts
export async function GET() {
  // Add proper authorization check
  const session = await requireAdmin();
  // Only fetch and return data if user is admin
}`}
                    </pre>
                  </div>
                  <div className="bg-white rounded p-4">
                    <p className="text-sm font-semibold text-gray-800 mb-2">2. Never Trust Client-Side Checks:</p>
                    <p className="text-xs text-gray-700">
                      Client-side checks hanya untuk UX (menampilkan/menyembunyikan UI).
                      Real authorization HARUS dilakukan di server-side!
                    </p>
                  </div>
                  <div className="bg-white rounded p-4">
                    <p className="text-sm font-semibold text-gray-800 mb-2">3. Principle:</p>
                    <p className="text-xs text-gray-700">
                      "Never make security decisions based on client-provided data" -
                      Semua authorization decisions harus dibuat di server.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
