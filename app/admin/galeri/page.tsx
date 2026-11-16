'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import { Galeri } from '@/types';

export default function AdminGaleriPage() {
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
        if (response.status === 401 || response.status === 403) {
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

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`/api/galeri/${id}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve galeri');
      }

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
        <AdminNav />
        <div className="container mx-auto px-4 py-8"><p>Loading...</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Galeri</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galeriList.map((galeri) => (
            <div key={galeri.id} className="card">
              <img src={galeri.image_url} alt={galeri.title} className="w-full h-48 object-cover rounded mb-4" />
              <h3 className="text-lg font-bold mb-2">{galeri.title}</h3>
              {galeri.description && <p className="text-gray-600 mb-4">{galeri.description}</p>}
              <div className="text-sm text-gray-500 mb-4">
                <p>Author: {galeri.author_username}</p>
                <p>Status: {galeri.approved_by ? `Approved` : 'Pending'}</p>
              </div>
              <div className="flex flex-col gap-2">
                {!galeri.approved_by && (
                  <button onClick={() => handleApprove(galeri.id)} className="btn-success">
                    Approve
                  </button>
                )}
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
                  className="btn-secondary"
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(galeri.id)} className="btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
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
                  <label className="block text-gray-700 font-semibold mb-2">Description</label>
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
                    required
                  />
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
