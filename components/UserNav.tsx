'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function UserNav() {
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
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-8">
            <Link href="/user/dashboard" className="text-2xl font-bold">
              BAC Labs - User
            </Link>
            <div className="flex gap-4">
              <Link
                href="/user/dashboard"
                className={`px-4 py-2 rounded ${
                  isActive('/user/dashboard')
                    ? 'bg-green-700'
                    : 'hover:bg-green-700'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/user/news"
                className={`px-4 py-2 rounded ${
                  pathname?.startsWith('/user/news')
                    ? 'bg-green-700'
                    : 'hover:bg-green-700'
                }`}
              >
                News
              </Link>
              <Link
                href="/user/gallery"
                className={`px-4 py-2 rounded ${
                  pathname?.startsWith('/user/gallery')
                    ? 'bg-green-700'
                    : 'hover:bg-green-700'
                }`}
              >
                Gallery
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
