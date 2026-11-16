'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import { News } from '@/types';

export default function AdminNewsPage() {
  const router = useRouter();
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Failed to fetch news');
      }

      setNewsList(data.news);
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
      const url = editingNews ? `/api/news/${editingNews.id}` : '/api/news';
      const method = editingNews ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save news');

      setShowModal(false);
      setEditingNews(null);
      setFormData({ title: '', content: '', image_url: '' });
      fetchNews();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`/api/news/${id}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve news');
      }

      fetchNews();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus news ini?')) return;

    try {
      const response = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete news');
      }
      fetchNews();
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
          <h1 className="text-3xl font-bold">Manage News</h1>
          <button
            onClick={() => {
              setEditingNews(null);
              setFormData({ title: '', content: '', image_url: '' });
              setShowModal(true);
            }}
            className="btn-primary"
          >
            + Add News
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {newsList.map((news) => (
            <div key={news.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{news.title}</h3>
                  <p className="text-gray-600 mb-4">{news.content}</p>
                  {news.image_url && (
                    <img src={news.image_url} alt={news.title} className="w-64 h-32 object-cover rounded mb-4" />
                  )}
                  <div className="text-sm text-gray-500">
                    <p>Author: {news.author_username}</p>
                    <p>Status: {news.approved_by ? `Approved by ${news.approver_username}` : 'Pending'}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {!news.approved_by && (
                    <button onClick={() => handleApprove(news.id)} className="btn-success">
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingNews(news);
                      setFormData({
                        title: news.title,
                        content: news.content,
                        image_url: news.image_url || '',
                      });
                      setShowModal(true);
                    }}
                    className="btn-secondary"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(news.id)} className="btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-2xl font-bold mb-4">
                {editingNews ? 'Edit News' : 'Add News'}
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
                  <label className="block text-gray-700 font-semibold mb-2">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input-field"
                    rows={5}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">Image URL</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1">Save</button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingNews(null);
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
