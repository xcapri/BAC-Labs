'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS, API_EXAMPLES, createUser } from '@/lib/api/endpoints';

/**
 * PUBLIC REGISTRATION PAGE
 *
 * VULNERABILITY: This page imports and exposes admin API endpoint configuration!
 *
 * Attack Vector:
 * 1. Attacker visits this public registration page (no login required)
 * 2. Opens Browser DevTools (F12) -> Sources/Debugger tab
 * 3. Searches for "endpoints.ts" or "api/users" in JavaScript bundle
 * 4. Finds the complete API configuration with payload examples
 * 5. Sees that it accepts "role" parameter including "admin"
 * 6. Copies the endpoint and payload structure
 * 7. Exploits the endpoint to create admin account without authentication
 */

export default function RegisterPage() {
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // VULNERABILITY: Using imported API config that exposes admin endpoints!
  useEffect(() => {
    // This runs on page load and logs sensitive API information
    console.log('🔓 Loaded API Configuration');
    console.log('📍 User Creation Endpoint:', API_ENDPOINTS.users.create);
    console.log('📋 Payload Schema:', API_ENDPOINTS.users.schema.create);
    console.log('💡 Example Payloads:', API_EXAMPLES.createUser);
    console.log('⚠️ Admin example included:', API_EXAMPLES.createUser.adminExample);
  }, []);

  // VULNERABILITY: Function that shows how to call the API
  // Attacker can see this in DevTools and copy the implementation
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Registration is currently disabled. Contact administrator.');

    // This code is visible in browser DevTools Sources tab!
    // Shows exact usage of the createUser function
    console.log('Would call createUser() with:', {
      username: formData.username,
      password: formData.password,
      role: 'user', // Attacker can see this can be changed to 'admin'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Register for a new account</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Register
            </button>
          </form>

          {message && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
              <p className="text-sm text-yellow-800">{message}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Vulnerability Explanation for Educational Purpose */}
        <div className="mt-6 bg-red-100 border-2 border-red-400 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-2xl mr-3">🔍</div>
            <div>
              <p className="text-sm font-bold text-red-800 mb-2">
                Vulnerability Learning Guide:
              </p>
              <div className="space-y-2">
                <div className="bg-white rounded p-2">
                  <p className="text-xs font-semibold text-gray-800 mb-1">Step 1: Open DevTools</p>
                  <p className="text-xs text-gray-700">
                    Tekan <kbd className="bg-gray-200 px-1 rounded">F12</kbd> atau klik kanan → Inspect
                  </p>
                </div>
                <div className="bg-white rounded p-2">
                  <p className="text-xs font-semibold text-gray-800 mb-1">Step 2: Check Console Tab</p>
                  <p className="text-xs text-gray-700">
                    Lihat console logs yang terekspos dengan API configuration
                  </p>
                </div>
                <div className="bg-white rounded p-2">
                  <p className="text-xs font-semibold text-gray-800 mb-1">Step 3: Search in Sources</p>
                  <p className="text-xs text-gray-700">
                    Sources tab → Search (<kbd className="bg-gray-200 px-1 rounded">Ctrl+Shift+F</kbd>) untuk:{' '}
                    <code className="bg-red-200 px-1 rounded">endpoints.ts</code>,{' '}
                    <code className="bg-red-200 px-1 rounded">API_ENDPOINTS</code>, atau{' '}
                    <code className="bg-red-200 px-1 rounded">api/users</code>
                  </p>
                </div>
                <div className="bg-white rounded p-2">
                  <p className="text-xs font-semibold text-gray-800 mb-1">Step 4: Access Global Variable</p>
                  <p className="text-xs text-gray-700">
                    Di Console tab, ketik: <code className="bg-red-200 px-1 rounded">window.__API_CONFIG__</code>
                  </p>
                </div>
                <div className="bg-white rounded p-2">
                  <p className="text-xs font-semibold text-gray-800 mb-1">Step 5: Exploit</p>
                  <p className="text-xs text-gray-700">
                    Copy payload dari <code className="bg-red-200 px-1 rounded">adminExample</code> dan
                    gunakan untuk create admin account via <code className="bg-red-200 px-1 rounded">POST /api/users</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-800">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Hidden script that further exposes the API - visible in DevTools */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // VULNERABILITY: API documentation exposed in client-side code!
            // This can be found by searching JavaScript files in DevTools

            window.API_ENDPOINTS = {
              users: {
                create: '/api/users',
                method: 'POST',
                description: 'Create new user - requires admin authentication (but not enforced!)',
                payload: {
                  username: 'string',
                  password: 'string',
                  role: 'user|admin' // EXPOSED: Shows admin role is possible!
                },
                example: {
                  username: 'newuser',
                  password: 'password123',
                  role: 'admin' // CRITICAL: Example shows how to create admin!
                }
              }
            };

            // Log for attackers to find in console
            console.log('API Endpoints loaded:', window.API_ENDPOINTS);
          `,
        }}
      />
    </div>
  );
}
