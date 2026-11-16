import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import AdminNav from '@/components/AdminNav';
import db from '@/lib/db';

export default async function AdminDashboard() {
  try {
    const session = await requireAdmin();

    // Get statistics
    const stats = {
      totalUsers: (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count,
      totalNews: (db.prepare('SELECT COUNT(*) as count FROM news').get() as any).count,
      pendingNews: (db.prepare('SELECT COUNT(*) as count FROM news WHERE approved_by IS NULL').get() as any).count,
      totalGaleri: (db.prepare('SELECT COUNT(*) as count FROM galeri').get() as any).count,
      pendingGaleri: (db.prepare('SELECT COUNT(*) as count FROM galeri WHERE approved_by IS NULL').get() as any).count,
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Dashboard Admin</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card bg-blue-500 text-white">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-4xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="card bg-green-500 text-white">
              <h3 className="text-lg font-semibold mb-2">Total News</h3>
              <p className="text-4xl font-bold">{stats.totalNews}</p>
            </div>
            <div className="card bg-yellow-500 text-white">
              <h3 className="text-lg font-semibold mb-2">Pending News</h3>
              <p className="text-4xl font-bold">{stats.pendingNews}</p>
            </div>
            <div className="card bg-purple-500 text-white">
              <h3 className="text-lg font-semibold mb-2">Total Galeri</h3>
              <p className="text-4xl font-bold">{stats.totalGaleri}</p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Selamat Datang, {session.username}!</h2>
            <p className="text-gray-600 mb-4">
              Anda login sebagai <strong>Administrator</strong>. Anda memiliki akses penuh ke semua fitur sistem.
            </p>
            <div className="space-y-2 text-sm">
              <p>✓ Kelola semua users</p>
              <p>✓ Approve/reject news dan galeri</p>
              <p>✓ CRUD semua konten</p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      redirect('/login');
    }
    throw error;
  }
}
