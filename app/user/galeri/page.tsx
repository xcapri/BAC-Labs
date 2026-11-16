'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserNav from '@/components/UserNav';
import { Galeri } from '@/types';

export default function UserGaleriPage() {
  const router = useRouter();
  const [galeriList, setGaleriList] = useState<Galeri[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGaleri, setEditingGaleri] = useState<Galeri | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
  });

  useEffect(() => {
    fetchGaleri();
  }, []);

  const fetchGaleri = async () => {
    try {
      const response = await fetch('/api/galeri');
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Failed to fetch galeri');
      }

      setGaleriList(data.galeri);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingGaleri ? `/api/galeri/${editingGaleri.id}` : '/api/galeri';
      const method = editingGaleri ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save galeri');

      setShowModal(false);
      setEditingGaleri(null);
      setFormData({ title: '', description: '', image_url: '' });
      fetchGaleri();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus galeri ini?')) return;

    try {
      const response = await fetch(`/api/galeri/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete galeri');
      }
      fetchGaleri();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNav />
        <div className="container mx-auto px-4 py-8"><p>Loading...</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Galeri</h1>
          <button
            onClick={() => {
              setEditingGaleri(null);
              setFormData({ title: '', description: '', image_url: '' });
              setShowModal(true);
            }}
            className="btn-primary"
          >
            + Add Galeri
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="card bg-blue-50 border border-blue-300 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Info:</strong> Galeri yang Anda buat perlu disetujui oleh admin sebelum muncul di halaman depan.
            Status approval akan ditampilkan di setiap galeri.
          </p>
        </div>

        {galeriList.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">Anda belum membuat galeri apapun.</p>
            <button
              onClick={() => {
                setEditingGaleri(null);
                setFormData({ title: '', description: '', image_url: '' });
                setShowModal(true);
              }}
              className="btn-primary"
            >
              Buat Galeri Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galeriList.map((galeri) => (
              <div key={galeri.id} className="card">
                <div className="relative mb-3">
                  {galeri.approved_by ? (
                    <span className="absolute top-2 right-2 text-xs bg-green-500 text-white px-2 py-1 rounded font-semibold shadow">
                      ✓ Approved
                    </span>
                  ) : (
                    <span className="absolute top-2 right-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded font-semibold shadow">
                      ⏳ Pending
                    </span>
                  )}
                  <img src={galeri.image_url} alt={galeri.title} className="w-full h-48 object-cover rounded" />
                </div>
                <h3 className="text-lg font-bold mb-2">{galeri.title}</h3>
                {galeri.description && <p className="text-gray-600 mb-4 text-sm">{galeri.description}</p>}
                <div className="text-xs text-gray-500 mb-4">
                  <p>Created: {new Date(galeri.created_at).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setEditingGaleri(galeri);
                      setFormData({
                        title: galeri.title,
                        description: galeri.description || '',
                        image_url: galeri.image_url,
                      });
                      setShowModal(true);
                    }}
                    className="btn-secondary text-sm"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(galeri.id)} className="btn-danger text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingGaleri ? 'Edit Galeri' : 'Add Galeri'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Description (optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows={3}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Image URL</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tip: Gunakan https://via.placeholder.com/600x400 untuk testing
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1">Save</button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingGaleri(null);
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
