'use client';

import { useState } from 'react';
import Link from 'next/link';
import UserNav from '@/components/UserNav';

export default function ScenarioBACPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [showCurl, setShowCurl] = useState(false);
  const [showFetch, setShowFetch] = useState(false);

  const exploitEndpoint = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const curlCommand = `curl -X POST http://localhost:3000/api/users \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "${username || 'hacker'}",
    "password": "${password || 'password123'}",
    "role": "${role}"
  }'`;

  const fetchCommand = `fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: '${username || 'hacker'}',
    password: '${password || 'password123'}',
    role: '${role}'
  })
})
  .then(r => r.json())
  .then(d => console.log(d))`;

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />
      <div className="container mx-auto px-4 py-8">
        {/* Vulnerability Warning Banner */}
        <div className="bg-red-100 border-2 border-red-500 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="text-3xl mr-4">🚨</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-red-800 mb-2">
                Broken Access Control - Unauthorized User Registration
              </h2>
              <p className="text-red-700 mb-4">
                Endpoint <code className="bg-red-200 px-2 py-1 rounded">POST /api/users</code> tidak memiliki
                authentication atau authorization check!
              </p>
              <div className="bg-white rounded p-4 mt-4">
                <p className="font-semibold text-gray-800 mb-2">Vulnerability Explanation:</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>
                    Endpoint <code className="bg-gray-200 px-2 py-1 rounded">POST /api/users</code> tidak memerlukan autentikasi
                  </li>
                  <li>
                    Tidak ada form register yang visible di UI (hanya admin yang bisa create user)
                  </li>
                  <li>
                    Attacker dapat menemukan endpoint ini melalui browser Developer Tools (Network Tab)
                  </li>
                  <li>
                    Dengan endpoint ini, attacker dapat membuat akun admin baru tanpa otorisasi!
                  </li>
                  <li>
                    Ini adalah contoh klasik <strong>Broken Access Control (BAC)</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Broken Access Control Demo</h1>
          <Link href="/user/dashboard" className="btn-secondary">
            ← Kembali ke Dashboard
          </Link>
        </div>

        {/* Attack Scenario */}
        <div className="card mb-6 bg-blue-50 border border-blue-300">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📖 Attack Scenario:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Admin membuat user baru melalui dashboard protected</li>
            <li>Attacker membuka Browser Developer Tools (F12) dan melihat Network Tab</li>
            <li>Attacker melihat request <code className="bg-gray-200 px-1 rounded">POST /api/users</code> dengan payload</li>
            <li>Attacker copy request tersebut (sebagai cURL atau Fetch)</li>
            <li>Attacker menjalankan request tanpa authentication untuk membuat admin account</li>
            <li>Attacker login dengan account yang baru dibuat dan mendapat akses admin!</li>
          </ol>
        </div>

        {/* Exploit Form */}
        <div className="card mb-6">
          <h3 className="text-lg font-bold mb-4">🔓 Exploit: Create User Without Authentication</h3>
          <p className="text-sm text-gray-600 mb-4">
            Formulir ini akan memanggil endpoint <code className="bg-gray-200 px-2 py-1 rounded">POST /api/users</code> tanpa
            authentication header. Dalam kondisi normal, endpoint ini harus protected!
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="hacker"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role (Choose wisely!)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="user">user (Normal User)</option>
                <option value="admin">admin (Full Access!)</option>
              </select>
              {role === 'admin' && (
                <p className="mt-2 text-xs text-red-600 font-semibold">
                  ⚠️ Selecting admin will create an admin account without any authorization check!
                </p>
              )}
            </div>

            <button
              onClick={exploitEndpoint}
              disabled={loading || !username || !password}
              className="btn-danger w-full"
            >
              {loading ? 'Creating User...' : '🚨 Exploit - Create User Without Auth'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded">
              <p className="text-sm text-red-800">❌ Error: {error}</p>
            </div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-500 rounded">
              <p className="text-sm font-bold text-red-800 mb-2">
                ✅ VULNERABILITY EXPLOITED SUCCESSFULLY!
              </p>
              <p className="text-xs text-red-700 mb-3">
                User created without authentication! Vulnerability: {result.vulnerability}
              </p>
              <div className="bg-white rounded p-3">
                <p className="text-xs font-semibold text-gray-800 mb-1">Created User:</p>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(result.user, null, 2)}
                </pre>
              </div>
              {result.user.role === 'admin' && (
                <div className="mt-3 p-2 bg-red-700 text-white rounded">
                  <p className="text-xs font-bold">
                    🚨 CRITICAL: Admin account created without authorization!
                  </p>
                  <p className="text-xs mt-1">
                    You can now login with username: <code className="bg-red-900 px-1 rounded">{result.user.username}</code>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* How to Exploit */}
        <div className="card bg-yellow-50 border border-yellow-300">
          <h3 className="text-lg font-bold text-yellow-900 mb-3">🔧 Cara Exploit (Manual):</h3>

          <div className="space-y-4">
            {/* Method 1: cURL */}
            <div className="bg-white rounded p-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-gray-800">Method 1: Using cURL</p>
                <button
                  onClick={() => setShowCurl(!showCurl)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {showCurl ? 'Hide' : 'Show'}
                </button>
              </div>
              {showCurl && (
                <>
                  <p className="text-xs text-gray-600 mb-2">
                    Copy dan jalankan di terminal:
                  </p>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {curlCommand}
                  </pre>
                  <button
                    onClick={() => navigator.clipboard.writeText(curlCommand)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    📋 Copy to Clipboard
                  </button>
                </>
              )}
            </div>

            {/* Method 2: Fetch */}
            <div className="bg-white rounded p-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-gray-800">Method 2: Using Fetch in Browser Console</p>
                <button
                  onClick={() => setShowFetch(!showFetch)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {showFetch ? 'Hide' : 'Show'}
                </button>
              </div>
              {showFetch && (
                <>
                  <p className="text-xs text-gray-600 mb-2">
                    Buka Developer Console (F12) dan paste:
                  </p>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {fetchCommand}
                  </pre>
                  <button
                    onClick={() => navigator.clipboard.writeText(fetchCommand)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    📋 Copy to Clipboard
                  </button>
                </>
              )}
            </div>

            {/* Method 3: Burp Suite / ZAP */}
            <div className="bg-white rounded p-3">
              <p className="text-sm font-semibold text-gray-800 mb-2">Method 3: Using Burp Suite / OWASP ZAP</p>
              <ol className="list-decimal list-inside text-xs text-gray-700 space-y-1">
                <li>Intercept legitimate user creation request dari admin</li>
                <li>Send to Repeater</li>
                <li>Hapus/remove authentication headers (Cookie, Authorization, dll)</li>
                <li>Modify payload: ubah role menjadi "admin"</li>
                <li>Send request - jika vulnerable, user akan dibuat tanpa auth!</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Fix Instructions */}
        <div className="card mt-8 bg-green-50 border border-green-300">
          <h3 className="text-lg font-bold text-green-900 mb-3">🛠️ Cara Fix Vulnerability Ini:</h3>
          <div className="bg-white rounded p-4">
            <p className="text-sm text-gray-700 mb-3">
              Edit file <code className="bg-gray-200 px-2 py-1 rounded">/app/api/users/route.ts</code>:
            </p>

            <p className="text-sm font-semibold text-red-800 mb-2">❌ Current (Vulnerable):</p>
            <pre className="bg-red-50 border border-red-300 p-3 rounded text-xs mb-4 overflow-x-auto">
{`export async function POST(request: NextRequest) {
  // VULNERABILITY: NO AUTHENTICATION CHECK!
  // await requireAdmin(); // <-- This is commented out!

  const { username, password, role } = await request.json();

  // Anyone can create users, even admins!
  // ...
}`}
            </pre>

            <p className="text-sm font-semibold text-green-800 mb-2">✓ Fixed (Secure):</p>
            <pre className="bg-green-50 border border-green-300 p-3 rounded text-xs mb-4 overflow-x-auto">
{`export async function POST(request: NextRequest) {
  // Add proper authentication and authorization
  await requireAdmin(); // Only admins can create users

  const { username, password, role } = await request.json();

  // Additional validation
  if (role === 'admin') {
    // Extra check: only super-admins can create admin accounts
    const session = await getSession();
    if (!session.user.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Only super-admins can create admin accounts' },
        { status: 403 }
      );
    }
  }

  // ...
}`}
            </pre>

            <div className="bg-blue-50 border border-blue-300 rounded p-3 mt-4">
              <p className="text-xs font-semibold text-blue-900 mb-2">Best Practices:</p>
              <ul className="list-disc list-inside text-xs text-blue-800 space-y-1">
                <li><strong>Always require authentication</strong> untuk semua endpoints yang modify data</li>
                <li><strong>Implement proper authorization</strong> - pastikan user memiliki role yang tepat</li>
                <li><strong>Validate role assignments</strong> - jangan biarkan user biasa create admin accounts</li>
                <li><strong>Log all user creation</strong> untuk audit trail</li>
                <li><strong>Rate limiting</strong> untuk prevent mass account creation</li>
                <li><strong>CAPTCHA</strong> untuk public registration endpoints</li>
              </ul>
            </div>
          </div>
        </div>

        {/* OWASP Reference */}
        <div className="card mt-8 bg-purple-50 border border-purple-300">
          <h3 className="text-lg font-bold text-purple-900 mb-3">📚 OWASP Reference:</h3>
          <p className="text-sm text-purple-800 mb-2">
            <strong>A01:2021 - Broken Access Control</strong>
          </p>
          <p className="text-xs text-purple-700">
            Moving up from the fifth position, 94% of applications were tested for some form of broken access control
            with the average incidence rate of 3.81%. Access control enforces policy such that users cannot act outside
            of their intended permissions. Failures typically lead to unauthorized information disclosure, modification,
            or destruction of all data or performing a business function outside the user's limits.
          </p>
          <a
            href="https://owasp.org/Top10/A01_2021-Broken_Access_Control/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-purple-600 hover:text-purple-800 underline mt-2 inline-block"
          >
            Read more on OWASP Top 10
          </a>
        </div>
      </div>
    </div>
  );
}
