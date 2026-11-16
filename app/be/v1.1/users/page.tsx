import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';

/**
 * SKENARIO 1.1 - Forced Browsing
 *
 * This page is PROPERLY PROTECTED with requireAdmin()
 * But the API endpoint /api/v1.1/users is NOT protected
 * Demonstrating that protecting only the page is not enough
 */

export default async function Scenario11UsersPage() {
  try {
    // PROPER IMPLEMENTATION: Using requireAdmin()
    await requireAdmin();

    // If user is not admin, requireAdmin() will throw error
    // This page will never render for non-admin users

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-2xl">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-green-800 mb-4">
              Page is Protected!
            </h1>
            <p className="text-gray-700 mb-4">
              Halaman ini sudah properly protected dengan <code className="bg-gray-200 px-2 py-1 rounded">requireAdmin()</code>.
            </p>
            <p className="text-gray-700 mb-4">
              Hanya admin yang bisa melihat halaman ini.
            </p>
            <div className="bg-yellow-50 border border-yellow-300 rounded p-4 mt-6">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                ⚠️ Tapi ada vulnerability di API endpoint!
              </p>
              <p className="text-sm text-yellow-700">
                Meskipun halaman ini protected, API endpoint <code className="bg-yellow-200 px-1 py-0.5 rounded">/api/v1.1/users</code> masih bisa diakses langsung.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    if (error.message?.includes('Forbidden')) {
      // User is authenticated but not admin - redirect to user dashboard
      redirect('/user/dashboard');
    }
    if (error.message?.includes('Unauthorized')) {
      // User is not authenticated - redirect to login
      redirect('/login');
    }
    throw error;
  }
}
