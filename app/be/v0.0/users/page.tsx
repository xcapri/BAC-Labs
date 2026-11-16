import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { User } from '@/types';
import UserNav from '@/components/UserNav';

/**
 * SKENARIO 0.0 - BAC SSR (Server-Side Rendering Vulnerability)
 *
 * VULNERABILITY: No role check! Any authenticated user can access this page
 * Proper implementation should use requireAdmin() instead of getSession()
 */

export default async function Scenario00UsersPage() {
  try {
    const session = await getSession();

    if (!session) {
      redirect('/login');
    }

    // VULNERABILITY: Not checking if user is admin!
    // Should have: if (session.role !== 'admin') { redirect('/user/dashboard'); }

    // Fetch all users from database (SSR - rendered on server)
    const users = db.prepare(`
      SELECT id, username, role, created_at
      FROM users
      ORDER BY created_at DESC
    `).all() as User[];

    return (
      <div className="min-h-screen bg-gray-50">
        <UserNav />
        <div className="container mx-auto px-4 py-8">
          {/* Vulnerability Warning Banner */}
          <div className="bg-red-100 border-2 border-red-500 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="text-3xl mr-4">🔓</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-red-800 mb-2">
                  Skenario 0.0 - Broken Access Control (SSR)
                </h2>
                <p className="text-red-700 mb-4">
                  Anda sedang mengakses halaman admin sebagai <strong>user biasa</strong>!
                </p>
                <div className="bg-white rounded p-4 mt-4">
                  <p className="font-semibold text-gray-800 mb-2">Vulnerability Explanation:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>
                      Endpoint <code className="bg-gray-200 px-2 py-1 rounded">/be/v0.0/users</code> tidak memiliki authorization check yang proper
                    </li>
                    <li>
                      Kode hanya menggunakan <code className="bg-gray-200 px-2 py-1 rounded">getSession()</code> tanpa validasi role
                    </li>
                    <li>
                      Page di-render di server (SSR) tapi tidak ada pengecekan apakah user adalah admin
                    </li>
                    <li>
                      Seharusnya menggunakan <code className="bg-gray-200 px-2 py-1 rounded">requireAdmin()</code> untuk memastikan hanya admin yang bisa akses
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">User Management (VULNERABLE PAGE)</h1>
            <Link href="/user/dashboard" className="btn-secondary">
              ← Kembali ke Dashboard
            </Link>
          </div>

          <div className="card mb-4 bg-yellow-50 border border-yellow-300">
            <p className="text-sm text-yellow-800">
              <strong>Current User:</strong> {session.username} (Role: {session.role})
            </p>
            <p className="text-sm text-yellow-800 mt-2">
              <strong>⚠️ Security Issue:</strong> User biasa seharusnya tidak bisa mengakses halaman ini!
            </p>
            <p className="text-sm text-yellow-800 mt-2">
              <strong>API Endpoint:</strong> <code className="bg-yellow-200 px-2 py-1 rounded">/api/v0.0/users</code>
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
                        🔓 Exposed!
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card mt-8 bg-blue-50 border border-blue-300">
            <h3 className="text-lg font-bold text-blue-900 mb-3">🛠️ Cara Fix Vulnerability Ini:</h3>
            <div className="bg-white rounded p-4">
              <p className="text-sm text-gray-700 mb-3">Ganti kode berikut:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs mb-3 overflow-x-auto">
{`// VULNERABLE CODE
const session = await getSession();
if (!session) {
  redirect('/login');
}
// No role check here!`}
              </pre>
              <p className="text-sm text-gray-700 mb-3">Menjadi:</p>
              <pre className="bg-green-50 border border-green-300 p-3 rounded text-xs overflow-x-auto">
{`// SECURE CODE
const session = await requireAdmin();
// requireAdmin() akan throw error jika bukan admin
// dan akan redirect ke /login atau /user/dashboard`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      redirect('/login');
    }
    throw error;
  }
}
