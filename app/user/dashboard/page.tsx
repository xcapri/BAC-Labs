import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import UserNav from '@/components/UserNav';
import LearningSection from '@/components/LearningSection';
import db from '@/lib/db';

export default async function UserDashboard() {
  try {
    const session = await requireAuth();

    if (session.role === 'admin') {
      redirect('/admin/dashboard');
    }

    // Get user's statistics
    const myNews = (db.prepare('SELECT COUNT(*) as count FROM news WHERE author_id = ?').get(session.userId) as any).count;
    const myNewsApproved = (db.prepare('SELECT COUNT(*) as count FROM news WHERE author_id = ? AND approved_by IS NOT NULL').get(session.userId) as any).count;
    const myGaleri = (db.prepare('SELECT COUNT(*) as count FROM galeri WHERE author_id = ?').get(session.userId) as any).count;
    const myGaleriApproved = (db.prepare('SELECT COUNT(*) as count FROM galeri WHERE author_id = ? AND approved_by IS NOT NULL').get(session.userId) as any).count;

    return (
      <div className="min-h-screen bg-gray-50">
        <UserNav />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Dashboard User</h1>

          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-4">Selamat Datang, {session.username}!</h2>
            <p className="text-gray-600 mb-4">
              Anda login sebagai <strong>User</strong>. Anda dapat mengelola konten news dan galeri Anda.
            </p>
            <p className="text-sm text-gray-500">
              Konten yang Anda buat perlu disetujui oleh admin sebelum muncul di halaman depan.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card bg-blue-500 text-white">
              <h3 className="text-lg font-semibold mb-2">My News</h3>
              <p className="text-4xl font-bold">{myNews}</p>
            </div>
            <div className="card bg-green-500 text-white">
              <h3 className="text-lg font-semibold mb-2">News Approved</h3>
              <p className="text-4xl font-bold">{myNewsApproved}</p>
            </div>
            <div className="card bg-purple-500 text-white">
              <h3 className="text-lg font-semibold mb-2">My Galeri</h3>
              <p className="text-4xl font-bold">{myGaleri}</p>
            </div>
            <div className="card bg-orange-500 text-white">
              <h3 className="text-lg font-semibold mb-2">Galeri Approved</h3>
              <p className="text-4xl font-bold">{myGaleriApproved}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card mb-8">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="flex gap-4">
              <Link href="/user/news" className="btn-primary">
                Manage News
              </Link>
              <Link href="/user/galeri" className="btn-primary">
                Manage Galeri
              </Link>
            </div>
          </div>

          {/* Vulnerability Learning Section - Client Component */}
          <LearningSection />
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
