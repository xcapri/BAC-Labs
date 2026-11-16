'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserNav from '@/components/UserNav';

export default function ATO2ScenarioPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    uuid: '',
    username: '',
    newPassword: ''
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [approvedNews, setApprovedNews] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);

  useEffect(() => {
    // Fetch current user info
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          setFormData(prev => ({
            ...prev,
            uuid: data.user.uuid || '',
            username: data.user.username
          }));
        }
      })
      .catch(err => console.error('Error fetching user:', err));

    // Fetch approved news with exposed UUIDs
    fetch('/api/ato-2/news')
      .then(res => res.json())
      .then(data => {
        if (data.news) {
          setApprovedNews(data.news);
        }
      })
      .catch(err => console.error('Error fetching news:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/ato-2/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid: formData.uuid,
          username: formData.username,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Password berhasil diubah untuk user: ${data.username}`);
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

  const fillUUID = (uuid: string, username: string) => {
    setFormData({
      ...formData,
      uuid: uuid,
      username: username
    });
    setShowNewsModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </button>
        </div>

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
                  Scenario ATO-2: Account Takeover via Exposed UUID
                </h3>
                <div className="text-red-700 space-y-2">
                  <p><strong>Vulnerability:</strong> Admin upgraded from integer ID to UUID for "security", but UUIDs are exposed in API responses.</p>
                  <p><strong>Risk:</strong> UUIDs are visible in approved_by_uuid field, allowing attackers to collect them and perform account takeover.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Guide */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">🎓 How to Exploit (Educational Purpose Only)</h3>
            <div className="text-blue-700 space-y-3">
              <div>
                <p className="font-semibold">Step 1: Discover UUID Exposure</p>
                <p className="text-sm">View approved news/galeri and inspect the API response</p>
                <code className="block bg-gray-800 text-green-400 p-2 rounded text-xs mt-1">
                  GET /api/ato-2/news → Look for "approver_uuid" field
                </code>
              </div>
              <div>
                <p className="font-semibold">Step 2: Collect Target UUIDs</p>
                <p className="text-sm">Extract UUIDs from approved content to identify admin/target accounts</p>
                <button
                  onClick={() => setShowNewsModal(true)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  View Exposed UUIDs
                </button>
              </div>
              <div>
                <p className="font-semibold">Step 3: Exploit Using UUID</p>
                <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm mt-2 overflow-x-auto">
{`curl -X POST http://localhost:3003/api/ato-2/change-password \\
  -H "Content-Type: application/json" \\
  -d '{"uuid": "abc-123-def", "username": "admin", "newPassword": "hacked"}'`}
                </code>
              </div>
              <div>
                <p className="font-semibold">Key Insight:</p>
                <p className="text-sm">UUID ≠ Security! Using UUID instead of integer ID doesn't fix the authorization flaw. The real issue is missing authorization checks, not ID predictability.</p>
              </div>
            </div>
          </div>

          {/* Current User Info */}
          {currentUser && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3">Your Account Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">User ID:</span>
                  <span className="ml-2 font-mono font-semibold">{currentUser.id}</span>
                </div>
                <div>
                  <span className="text-gray-600">UUID:</span>
                  <span className="ml-2 font-mono font-semibold text-xs break-all">{currentUser.uuid}</span>
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
            <h2 className="text-2xl font-bold mb-6">Change Password</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User UUID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.uuid}
                  onChange={(e) => setFormData({ ...formData, uuid: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter UUID (e.g., abc-123-def-456)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Click "View Exposed UUIDs" button above to see available UUIDs from approved content
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
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
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
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* How to Fix */}
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mt-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">🔒 How to Fix This Vulnerability</h3>
            <div className="text-green-700 space-y-2">
              <p><strong>1. Don't Expose UUIDs:</strong> Never return internal identifiers (ID or UUID) in public API responses</p>
              <p><strong>2. Implement Authorization:</strong> Verify the logged-in user owns the account being modified</p>
              <p><strong>3. Use Session Data:</strong> Get user identifier from authenticated session, not from request</p>
              <p><strong>4. Understand Security:</strong> UUID is not a security feature - it's just a different ID format</p>
              <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm mt-2">
{`// Secure version
const session = await requireAuth();
// Use session.userId only - don't accept user identifier from request
db.prepare('UPDATE users SET password = ? WHERE id = ?')
  .run(hashedPassword, session.userId);`}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* UUID List Modal */}
      {showNewsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Exposed UUIDs in Approved News</h3>
                <button
                  onClick={() => setShowNewsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Click on any row to auto-fill the form with that user's UUID
              </p>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">News Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approver</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approver UUID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {approvedNews.map((news) => (
                      <tr key={news.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{news.title}</td>
                        <td className="px-4 py-3 text-sm font-semibold">{news.approver_username}</td>
                        <td className="px-4 py-3 text-xs font-mono text-red-600">{news.approver_uuid}</td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => fillUUID(news.approver_uuid, news.approver_username)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                          >
                            Use This
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
