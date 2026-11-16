'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserNav from '@/components/UserNav';
import { Galeri } from '@/types';

export default function UserGalleryPage() {
  const router = useRouter();
  const [gallery, setGallery] = useState<Galeri[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Galeri | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/user/gallery');
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Failed to fetch gallery');
      }

      setGallery(data.gallery);
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
      const url = editingGallery
        ? `/api/user/gallery/${editingGallery.id}`
        : '/api/user/gallery';
      const method = editingGallery ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save gallery item');

      setShowModal(false);
      setEditingGallery(null);
      setFormData({ title: '', description: '', image_url: '' });
      fetchGallery();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item galeri ini?')) return;

    try {
      const response = await fetch(`/api/user/gallery/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete gallery item');
      }
      fetchGallery();
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
          <h1 className="text-3xl font-bold">My Gallery</h1>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setEditingGallery(null);
                setFormData({ title: '', description: '', image_url: '' });
                setShowModal(true);
              }}
              className="btn-primary"
            >
              + Add Image
            </button>
            <Link href="/user/dashboard" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="card bg-blue-50 border border-blue-300 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Info:</strong> Galeri yang Anda upload perlu disetujui oleh admin sebelum muncul di halaman galeri publik.
            Status approval akan ditampilkan di setiap item.
          </p>
        </div>

        {gallery.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">Anda belum mengupload gambar apapun.</p>
            <button
              onClick={() => {
                setEditingGallery(null);
                setFormData({ title: '', description: '', image_url: '' });
                setShowModal(true);
              }}
              className="btn-primary"
            >
              Upload Gambar Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((item) => (
              <div key={item.id} className="card">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded mb-4"
                />
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold flex-1">{item.title}</h3>
                  {item.approved_by ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">
                      ✓ Approved
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold">
                      ⏳ Pending
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                )}
                <div className="text-xs text-gray-500 mb-4">
                  <p>Created: {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                  {item.approved_by && item.approver_username && (
                    <p>Approved by: {item.approver_username}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingGallery(item);
                      setFormData({
                        title: item.title,
                        description: item.description || '',
                        image_url: item.image_url,
                      });
                      setShowModal(true);
                    }}
                    className="btn-secondary flex-1"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn-danger flex-1">
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
                {editingGallery ? 'Edit Gallery Item' : 'Add Gallery Item'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows={3}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Image URL *</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  {formData.image_url && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1">Save</button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingGallery(null);
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
