export interface User {
  id: number;
  username: string;
  password?: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface News {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  author_id: number;
  approved_by: number | null;
  created_at: string;
  updated_at: string;
  author_username?: string;
  approver_username?: string;
}

export interface Galeri {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  author_id: number;
  approved_by: number | null;
  created_at: string;
  updated_at: string;
  author_username?: string;
  approver_username?: string;
}
