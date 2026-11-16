'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setLoading(false);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-8">
            <Link href="/admin/dashboard" className="text-2xl font-bold">
              BAC Labs - Admin
            </Link>
            <div className="flex gap-4">
              <Link
                href="/admin/dashboard"
                className={`px-4 py-2 rounded ${
                  isActive('/admin/dashboard')
                    ? 'bg-blue-700'
                    : 'hover:bg-blue-700'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className={`px-4 py-2 rounded ${
                  isActive('/admin/users')
                    ? 'bg-blue-700'
                    : 'hover:bg-blue-700'
                }`}
              >
                Users
              </Link>
              <Link
                href="/admin/news"
                className={`px-4 py-2 rounded ${
                  isActive('/admin/news')
                    ? 'bg-blue-700'
                    : 'hover:bg-blue-700'
                }`}
              >
                News
              </Link>
              <Link
                href="/admin/galeri"
                className={`px-4 py-2 rounded ${
                  isActive('/admin/galeri')
                    ? 'bg-blue-700'
                    : 'hover:bg-blue-700'
                }`}
              >
                Galeri
              </Link>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </nav>
  );
}
