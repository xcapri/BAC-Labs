import Link from 'next/link';
import db from '@/lib/db';
import { News, Galeri } from '@/types';

export default async function Home() {
  // Fetch top 5 approved news
  const news = db.prepare(`
    SELECT n.*, u.username as author_username
    FROM news n
    LEFT JOIN users u ON n.author_id = u.id
    WHERE n.approved_by IS NOT NULL
    ORDER BY n.created_at DESC
    LIMIT 5
  `).all() as News[];

  // Fetch all approved galeri for slider
  const galeri = db.prepare(`
    SELECT g.*, u.username as author_username
    FROM galeri g
    LEFT JOIN users u ON g.author_id = u.id
    WHERE g.approved_by IS NOT NULL
    ORDER BY g.created_at DESC
  `).all() as Galeri[];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">BAC Labs</h1>
            <div className="flex gap-6 items-center">
              <a href="#news" className="text-gray-700 hover:text-blue-600">News</a>
              <a href="#galeri" className="text-gray-700 hover:text-blue-600">Galeri</a>
              <Link href="/login" className="btn-primary">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Broken Access Control Demo
          </h2>
          <p className="text-xl mb-8">
            Platform pembelajaran vulnerability Broken Access Control (BAC)
          </p>
          <Link href="/login" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block">
            Mulai Eksplorasi
          </Link>
        </div>
      </section>

      {/* Gallery Slider Section */}
      <section id="galeri" className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Galeri</h3>
          {galeri.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {galeri.slice(0, 8).map((item) => (
                <div key={item.id} className="card overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                  {item.description && (
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Belum ada galeri</p>
          )}
        </div>
      </section>

      {/* Top 5 News Section */}
      <section id="news" className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Top 5 News</h3>
          {news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <div key={item.id} className="card">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h4 className="font-bold text-xl mb-2">{item.title}</h4>
                  <p className="text-gray-600 mb-4 line-clamp-3">{item.content}</p>
                  <div className="text-sm text-gray-500">
                    <p>Oleh: {item.author_username}</p>
                    <p>{new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Belum ada berita</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 BAC Labs - Demo untuk pembelajaran keamanan aplikasi</p>
          <p className="text-sm text-gray-400 mt-2">
            Aplikasi ini sengaja dibuat vulnerable untuk tujuan edukasi
          </p>
        </div>
      </footer>
    </div>
  );
}
