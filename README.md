# Labs Broken Access Control

Demo aplikasi untuk pembelajaran vulnerability **Broken Access Control (BAC)** menggunakan Next.js, React, TypeScript, Tailwind CSS, dan SQLite.

## 📋 Deskripsi

Aplikasi ini sengaja dibuat dengan beberapa vulnerability terkait Broken Access Control untuk tujuan edukasi. Setiap skenario mendemonstrasikan tipe vulnerability yang berbeda dan cara exploit-nya.

**⚠️ PENTING**: Setiap skenario memiliki API endpoint yang **TERPISAH** untuk menghindari tabrakan vulnerability!

## 🏗️ Teknologi

- **Framework**: Next.js 15.5.5 (App Router)
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS v4.1.14 (PostCSS)
- **Database**: SQLite (better-sqlite3 v12.4.1) dengan WAL mode
- **Authentication**: JWT (jose v6.1.0)
- **Password Hashing**: bcryptjs v3.0.2
- **Language**: TypeScript 5.9.3
- **Build Tool**: Turbopack (Next.js dev)

## 🚀 Instalasi & Menjalankan

1. Install dependencies:
```bash
npm install
```

2. Jalankan development server:
```bash
npm run dev
```

3. Buka browser dan akses:
```
http://localhost:3000
```

4. Database akan otomatis dibuat saat pertama kali aplikasi dijalankan
   - File: `database.db`
   - Default users (admin & user) akan di-seed otomatis

## 👥 Default Credentials

### User Biasa
- Username: `user`
- Password: `user123`

## 📁 Struktur Project

```
labs/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/              # Authentication endpoints
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   ├── v0.0/              # Scenario 0.0 - SSR
│   │   │   └── users/route.ts
│   │   ├── v0.1/              # Scenario 0.1 - CSR
│   │   │   ├── users/route.ts
│   │   │   └── permissions/check/route.ts
│   │   ├── v1.1/              # Scenario 1.1 - Forced Browsing
│   │   │   └── users/route.ts
│   │   ├── ato-1/             # Scenario ATO-1
│   │   │   └── change-password/route.ts
│   │   ├── ato-2/             # Scenario ATO-2
│   │   │   ├── change-password/route.ts
│   │   │   └── news/route.ts
│   │   ├── users/             # User Management (Admin)
│   │   ├── news/              # News CRUD
│   │   ├── galeri/            # Gallery CRUD
│   │   └── public/            # Public APIs
│   │
│   ├── be/                     # Backend Pages
│   │   ├── v0.0/users/page.tsx
│   │   └── v1.1/users/page.tsx
│   │
│   ├── user/                   # User Dashboard & Scenarios
│   │   ├── dashboard/page.tsx
│   │   ├── scenario-0.0/page.tsx
│   │   ├── scenario-0.1/page.tsx
│   │   ├── scenario-1.1/page.tsx
│   │   ├── scenarios/
│   │   │   ├── ato-1/page.tsx
│   │   │   └── ato-2/page.tsx
│   │   ├── news/              # User news management
│   │   └── galeri/            # User gallery management
│   │
│   ├── admin/                  # Admin Dashboard
│   │   ├── dashboard/page.tsx
│   │   ├── users/page.tsx
│   │   ├── news/page.tsx
│   │   └── galeri/page.tsx
│   │
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── page.tsx               # Landing page
│   └── layout.tsx
│
├── lib/
│   ├── auth.ts                # JWT utilities & session management
│   ├── db.ts                  # SQLite database initialization
│   └── api/endpoints.ts
│
├── types/
│   └── index.ts               # TypeScript interfaces
│
├── components/                # React components
│   ├── UserNav.tsx
│   ├── LearningSection.tsx
│   └── ...
│
├── contexts/
│   └── GuideContext.tsx       # Global state management
│
├── database.db                # SQLite database file
├── package.json
├── next.config.js
├── tsconfig.json
└── README.md
```

## 📁 Struktur Database

### Table: users
- `id` - Primary key (integer, auto-increment)
- `uuid` - Unique UUID (for ATO-2 scenario)
- `username` - Unique username
- `password` - Hashed password
- `role` - 'admin' atau 'user'
- `created_at` - Timestamp

### Table: news
- `id` - Primary key
- `title` - Judul berita
- `content` - Konten berita
- `image_url` - URL gambar (optional)
- `author_id` - Foreign key ke users
- `approved_by` - Foreign key ke users (admin yang approve)
- `created_at`, `updated_at` - Timestamps

### Table: galeri
- `id` - Primary key
- `title` - Judul galeri
- `description` - Deskripsi (optional)
- `image_url` - URL gambar
- `author_id` - Foreign key ke users
- `approved_by` - Foreign key ke users (admin yang approve)
- `created_at`, `updated_at` - Timestamps

## 🎯 Fitur Aplikasi

### Halaman Public
- **Landing page** (`/`) - Menampilkan top 5 approved news dan galeri terbaru
- **Login page** (`/login`) - Authentication dengan JWT
- **Register page** (`/register`) - User registration

### Dashboard Admin (`/admin/*`)
- **User Management** - CRUD operations untuk mengelola users
- **News Management** - CRUD + approval workflow untuk news
- **Gallery Management** - CRUD + approval workflow untuk galeri
- **Statistics** - View stats tentang content dan users
- **Full access** ke semua fitur aplikasi

### Dashboard User (`/user/*`)
- **Scenario Access** - Akses ke 6 vulnerability learning scenarios
  - 3 BAC scenarios (0.0, 0.1, 1.1)
  - 2 ATO scenarios (ATO-1, ATO-2)
- **News Management** - CRUD news milik sendiri
- **Gallery Management** - CRUD galeri milik sendiri
- **View Statistics** - Melihat approval status content
- **Learning Resources** - Dokumentasi dan tutorial untuk setiap scenario

### Authentication System
- **JWT-based** authentication dengan httpOnly cookies
- **24-hour** token expiration
- **Role-based** access control (admin | user)
- **bcrypt** password hashing
- **Session management** via `lib/auth.ts`:
  - `getSession()` - Check authentication
  - `requireAuth()` - Require logged in user
  - `requireAdmin()` - Require admin role

## 🔓 Skenario Vulnerability

---

## 🛡️ Broken Access Control (BAC) Scenarios

### Skenario 0.0 - BAC SSR (Server-Side Rendering)
**Page**: `/be/v0.0/users`
**API**: `/api/v0.0/users`

**Vulnerability**:
- Endpoint halaman tidak memiliki proper authorization check
- Hanya menggunakan `getSession()` tanpa validasi role
- User biasa bisa akses halaman admin

**Cara Exploit**:
1. Login sebagai user biasa
2. Akses `/be/v0.0/users` atau klik dari dashboard
3. Data users akan ditampilkan meskipun bukan admin
4. API `/api/v0.0/users` juga bisa diakses langsung

**Fix**:
```typescript
// Di /app/be/v0.0/users/page.tsx
// Ganti getSession() dengan requireAdmin()
const session = await requireAdmin();
```

---

### Skenario 0.1 - BAC CSR (Client-Side Rendering)
**Page**: `/user/scenario-0.1`
**API**: `/api/v0.1/users`, `/api/v0.1/permissions/check`

**Vulnerability**:
- Authorization check dilakukan di client-side (browser)
- Menggunakan response dari `/api/v0.1/permissions/check` untuk menentukan akses
- Response API bisa dimanipulasi via DevTools
- API endpoint `/api/v0.1/users` tidak properly protected

**Cara Exploit**:
1. Login sebagai user biasa
2. Akses `/user/scenario-0.1`
3. Buka DevTools (F12) → Network tab
4. Refresh page dan intercept request ke `/api/v0.1/permissions/check`
5. Modify response: ubah `canAccessUsers: false` menjadi `true`
6. Atau gunakan button "Quick Bypass" untuk demo
7. Atau panggil langsung di console: `setCanAccessUsers(true); fetchUsers();`

**Fix**:
```typescript
// Di API endpoint /api/v0.1/users/route.ts
export async function GET() {
  const session = await requireAdmin(); // Add this!
  // Only fetch and return data if user is admin
}
```

---

### Skenario 1.1 - Forced Browsing
**Page**: `/be/v1.1/users` (Protected ✅)
**API**: `/api/v1.1/users` (Vulnerable ⚠️)

**Vulnerability**:
- Halaman `/be/v1.1/users` sudah properly protected dengan `requireAdmin()`
- Tapi API endpoint `/api/v1.1/users` masih bisa diakses langsung
- Attacker bisa bypass UI protection dengan direct API access

**Cara Exploit**:
1. Login sebagai user biasa
2. Akses `/user/scenario-1.1`
3. Klik button "Akses /api/v1.1/users"
4. Atau buka langsung di browser: `http://localhost:3000/api/v1.1/users`
5. Atau gunakan curl:
```bash
curl http://localhost:3000/api/v1.1/users \
  -H "Cookie: token=YOUR_TOKEN"
```

**Fix**:
```typescript
// Di /app/api/v1.1/users/route.ts
// Pastikan SEMUA API endpoint memiliki authorization check
export async function GET() {
  const session = await requireAdmin(); // Add this!
  // ...
}
```

---

## 🔐 Account Takeover (ATO) Scenarios

### Skenario ATO-1: Account Takeover via Enumerable ID
**Page**: `/user/scenarios/ato-1`
**API**: `/api/ato-1/change-password`

**Vulnerability**:
- Password change endpoint menerima user ID sebagai parameter
- ID user adalah integer sequential yang mudah di-enumerate (1, 2, 3, ...)
- Tidak ada authorization check - endpoint tidak verify apakah requester adalah pemilik akun
- Tidak perlu tahu password lama

**Cara Exploit**:
1. Login sebagai user biasa
2. Akses `/user/scenarios/ato-1`
3. Coba ubah ID menjadi 1 (biasanya admin)
4. Masukkan username "admin" dan password baru
5. Submit form - password admin berhasil diubah tanpa authorization!

**Menggunakan cURL**:
```bash
curl -X POST http://localhost:3003/api/ato-1/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "username": "admin",
    "newPassword": "hacked123"
  }'
```

**Root Cause**:
- Missing authorization: tidak ada pengecekan apakah user yang request adalah pemilik akun
- ID enumeration: menggunakan sequential integer ID yang predictable
- No current password verification

**Fix**:
```typescript
// Secure version
export async function POST(request: NextRequest) {
  const session = await requireAuth(); // 1. Require authentication
  const { newPassword, currentPassword } = await request.json();

  // 2. Use session ID, don't accept ID from request
  const userId = session.userId;

  // 3. Verify current password before allowing change
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const validPassword = bcrypt.compareSync(currentPassword, user.password);

  if (!validPassword) {
    return NextResponse.json({ error: 'Invalid current password' }, { status: 403 });
  }

  // 4. Update password
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, userId);

  return NextResponse.json({ success: true });
}
```

---

### Skenario ATO-2: Account Takeover via Exposed UUID
**Page**: `/user/scenarios/ato-2`
**API**: `/api/ato-2/change-password`, `/api/ato-2/news`

**Vulnerability**:
- Admin mengupgrade dari integer ID ke UUID untuk "meningkatkan security"
- Namun UUID di-expose dalam API response (field `approver_uuid` di news/galeri)
- Authorization check masih tidak ada - menggunakan UUID tidak fix masalah fundamental
- Attacker bisa collect UUID dari approved content

**Cara Exploit**:
1. Login sebagai user biasa
2. Akses `/user/scenarios/ato-2`
3. Klik "View Exposed UUIDs" untuk melihat list UUID yang ter-expose
4. Lihat news yang sudah di-approve - perhatikan field `approver_uuid`
5. Copy UUID admin dari response
6. Gunakan UUID tersebut untuk change password admin

**Menggunakan cURL**:
```bash
# Step 1: Get exposed UUIDs from approved news
curl http://localhost:3003/api/ato-2/news \
  -H "Cookie: token=YOUR_TOKEN"

# Response akan include:
# {
#   "news": [{
#     "approver_username": "admin",
#     "approver_uuid": "abc-123-def-456-..."  <-- UUID exposed!
#   }]
# }

# Step 2: Use UUID to takeover account
curl -X POST http://localhost:3003/api/ato-2/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "abc-123-def-456-...",
    "username": "admin",
    "newPassword": "hacked123"
  }'
```

**Root Cause**:
- **UUID is not a security feature!** UUID hanya mengganti format ID, bukan menyelesaikan masalah authorization
- UUID ter-expose di API response (information disclosure)
- Tidak ada authorization check
- Tidak ada current password verification

**Key Lesson**:
> Menggunakan UUID instead of integer ID **TIDAK** menyelesaikan masalah authorization. UUID hanyalah identifier yang berbeda format. Jika authorization check tidak ada, vulnerability tetap ada bahkan dengan UUID.

**Fix**:
```typescript
// 1. Don't expose UUID in API responses
const news = db.prepare(`
  SELECT n.id, n.title, n.content,
         u1.username as author_username,
         u2.username as approver_username
         -- Don't include u2.uuid!
  FROM news n
  LEFT JOIN users u1 ON n.author_id = u1.id
  LEFT JOIN users u2 ON n.approved_by = u2.id
`).all();

// 2. Implement proper authorization in change-password endpoint
export async function POST(request: NextRequest) {
  const session = await requireAuth();
  const { newPassword, currentPassword } = await request.json();

  // Use session userId - don't accept user identifier from request!
  const userId = session.userId;

  // Verify current password
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const validPassword = bcrypt.compareSync(currentPassword, user.password);

  if (!validPassword) {
    return NextResponse.json({ error: 'Invalid current password' }, { status: 403 });
  }

  // Update password
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, userId);

  return NextResponse.json({ success: true });
}
```

---

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - Login (returns JWT token in httpOnly cookie)
- `POST /api/auth/logout` - Logout (clears token cookie)
- `GET /api/auth/me` - Get current authenticated user info

### Public
- `GET /api/public/news` - Get approved news (top 5 latest)
- `GET /api/public/galeri` - Get approved galeri items

### Scenario 0.0 - SSR Vulnerability
- `GET /api/v0.0/users` - ⚠️ **VULNERABLE** - No authorization check

### Scenario 0.1 - CSR Vulnerability
- `GET /api/v0.1/permissions/check` - ⚠️ **VULNERABLE** - Client-side authorization
- `GET /api/v0.1/users` - ⚠️ **VULNERABLE** - No server-side authorization

### Scenario 1.1 - Forced Browsing
- `GET /api/v1.1/users` - ⚠️ **VULNERABLE** - API not protected (page is protected)

### Scenario ATO-1 - Enumerable ID
- `POST /api/ato-1/change-password` - ⚠️ **VULNERABLE** - No authorization, accepts ID from request

### Scenario ATO-2 - Exposed UUID
- `GET /api/ato-2/news` - ⚠️ **VULNERABLE** - Exposes UUID in response
- `POST /api/ato-2/change-password` - ⚠️ **VULNERABLE** - No authorization, accepts UUID from request

### Users (Admin only)
- `POST /api/users` - Create user ✅ Protected
- `GET /api/users/[id]` - Get user detail ✅ Protected
- `PUT /api/users/[id]` - Update user ✅ Protected
- `DELETE /api/users/[id]` - Delete user ✅ Protected

### News (Authenticated)
- `GET /api/news` - List news
- `POST /api/news` - Create news
- `GET /api/news/[id]` - Get news detail
- `PUT /api/news/[id]` - Update news
- `DELETE /api/news/[id]` - Delete news
- `POST /api/news/[id]/approve` - Approve news (Admin only)

### Galeri (Authenticated)
- `GET /api/galeri` - List galeri
- `POST /api/galeri` - Create galeri
- `GET /api/galeri/[id]` - Get galeri detail
- `PUT /api/galeri/[id]` - Update galeri
- `DELETE /api/galeri/[id]` - Delete galeri
- `POST /api/galeri/[id]/approve` - Approve galeri (Admin only)

## 📊 Struktur Endpoint per Skenario

### Broken Access Control (BAC)
```
📁 Skenario 0.0 (SSR Vulnerability)
├── Page:  /be/v0.0/users          → Vulnerable (no auth check)
└── API:   /api/v0.0/users          → Vulnerable (no auth check)

📁 Skenario 0.1 (CSR Vulnerability)
├── Page:  /user/scenario-0.1       → Client-side check
├── API:   /api/v0.1/permissions/check → Returns role info
└── API:   /api/v0.1/users          → Vulnerable (no server auth)

📁 Skenario 1.1 (Forced Browsing)
├── Page:  /be/v1.1/users           → Protected ✅ (requireAdmin)
└── API:   /api/v1.1/users          → Vulnerable ⚠️ (no auth check)
```

### Account Takeover (ATO)
```
📁 Skenario ATO-1 (Enumerable ID)
├── Page:  /user/scenarios/ato-1    → Settings page with ID enumeration
└── API:   /api/ato-1/change-password → Vulnerable (accepts ID from request)

📁 Skenario ATO-2 (Exposed UUID)
├── Page:  /user/scenarios/ato-2    → Settings page with UUID exploit
├── API:   /api/ato-2/news          → Exposes approver_uuid
└── API:   /api/ato-2/change-password → Vulnerable (accepts UUID from request)
```

## 📚 Konsep Penting

### Broken Access Control (BAC)
BAC terjadi ketika aplikasi tidak properly enforce restrictions terhadap authenticated users. User bisa melakukan action atau akses resource yang seharusnya tidak bisa mereka akses.

### Tipe-tipe BAC dalam aplikasi ini:

1. **Missing Authorization Check** (Skenario 0.0)
   - Tidak ada pengecekan role/permission sama sekali
   - Hanya check authentication, tidak check authorization

2. **Client-Side Authorization** (Skenario 0.1)
   - Authorization check dilakukan di browser
   - Mudah di-bypass dengan manipulasi JavaScript/response

3. **Forced Browsing** (Skenario 1.1)
   - UI/halaman sudah protected
   - Tapi API endpoint masih bisa diakses langsung
   - Attacker bypass melalui direct API access

### Best Practices untuk Mencegah BAC:

1. ✅ **Always perform authorization checks on the server-side**
2. ✅ **Check permissions for EVERY sensitive operation**
3. ✅ **Never trust client-side validation**
4. ✅ **Implement role-based access control (RBAC)**
5. ✅ **Use middleware for consistent authorization**
6. ✅ **Log and monitor authorization failures**
7. ✅ **Test authorization with different user roles**
8. ✅ **Protect BOTH pages AND API endpoints independently**

---

### Account Takeover (ATO)
ATO terjadi ketika attacker berhasil mendapatkan akses unauthorized ke akun user lain, biasanya dengan mengubah password atau session tanpa proper authorization.

### Tipe-tipe ATO dalam aplikasi ini:

1. **ID Enumeration Attack** (Skenario ATO-1)
   - Endpoint menerima user identifier (ID) dari request
   - ID adalah sequential integer yang mudah ditebak (1, 2, 3, ...)
   - Tidak ada authorization check untuk verify ownership
   - Attacker bisa enumerate IDs dan takeover akun manapun

2. **UUID Exposure Attack** (Skenario ATO-2)
   - Admin mengupgrade ke UUID thinking it's more secure
   - UUID ter-expose di API response (information disclosure)
   - Authorization check masih missing - UUID bukan solusi
   - Attacker collect UUIDs dan gunakan untuk takeover

### Best Practices untuk Mencegah ATO:

1. ✅ **Never accept user identifiers from request body**
   - Use authenticated session to get user ID
   - Don't trust ID/UUID from client

2. ✅ **Implement proper authorization checks**
   - Verify user owns the resource being modified
   - Check if user has permission for the action

3. ✅ **Require current password for sensitive operations**
   - Password changes should require current password
   - Email changes should require password confirmation

4. ✅ **Don't expose internal identifiers**
   - Don't return user IDs/UUIDs in public APIs
   - Use opaque tokens for public references

5. ✅ **UUID is NOT a security feature**
   - UUID just changes ID format, doesn't fix authorization
   - Security comes from proper authorization checks, not ID format

6. ✅ **Implement rate limiting**
   - Limit password change attempts
   - Detect enumeration attacks

7. ✅ **Log sensitive operations**
   - Log all password changes
   - Alert on suspicious activity

8. ✅ **Use multi-factor authentication**
   - Add extra layer of security
   - Prevent takeover even if password is compromised

## 🔍 Testing Tools

Gunakan tools berikut untuk testing vulnerability:

### 1. **Browser DevTools** (F12)
   - **Network tab** - Intercept dan inspect requests/responses
   - **Console** - Execute JavaScript untuk bypass client-side checks
   - **Application tab** - View/modify cookies dan localStorage
   - **Sources tab** - Set breakpoints dan debug code flow

**Contoh Exploit (Scenario 0.1):**
```javascript
// Di browser console
setCanAccessUsers(true);  // Bypass client-side check
fetchUsers();              // Fetch admin data
```

### 2. **Curl** - Test API endpoints
```bash
# Dapatkan token dulu dengan login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"user123"}' \
  -c cookies.txt

# Skenario 0.0 - SSR Vulnerability
curl http://localhost:3000/api/v0.0/users \
  -b cookies.txt

# Skenario 0.1 - CSR Vulnerability
curl http://localhost:3000/api/v0.1/permissions/check \
  -b cookies.txt

curl http://localhost:3000/api/v0.1/users \
  -b cookies.txt

# Skenario 1.1 - Forced Browsing
curl http://localhost:3000/api/v1.1/users \
  -b cookies.txt

# Skenario ATO-1 - Account Takeover
curl -X POST http://localhost:3000/api/ato-1/change-password \
  -H "Content-Type: application/json" \
  -d '{"id":1,"username":"admin","newPassword":"hacked123"}'

# Skenario ATO-2 - Exposed UUID
curl http://localhost:3000/api/ato-2/news \
  -b cookies.txt

curl -X POST http://localhost:3000/api/ato-2/change-password \
  -H "Content-Type: application/json" \
  -d '{"uuid":"EXPOSED_UUID","username":"admin","newPassword":"hacked123"}'
```

### 3. **Postman / Insomnia**
   - Import collection dari environment variables
   - Test API endpoints dengan organized requests
   - Modify headers, cookies, dan body
   - Automate testing dengan pre-request scripts
   - View formatted JSON responses

**Tips:**
- Set base URL: `http://localhost:3000`
- Import cookies dari browser atau login response
- Save common requests untuk quick testing

### 4. **Burp Suite / OWASP ZAP**
   - **Proxy** - Intercept dan modify HTTP traffic
   - **Repeater** - Replay dan modify requests
   - **Intruder** - Automated attacks (ID enumeration)
   - **Scanner** - Automated vulnerability detection
   - **Decoder** - Decode/encode JWT tokens

**Setup Burp Suite:**
1. Configure browser to use Burp proxy (127.0.0.1:8080)
2. Install Burp CA certificate
3. Enable intercept
4. Navigate aplikasi dan modify requests on-the-fly

### 5. **JWT Decoder**
   - [jwt.io](https://jwt.io) - Decode dan inspect JWT payload
   - Check expiration, role claims, dan user info
   - Verify signature (will fail with weak secret for education)

**Example JWT Payload:**
```json
{
  "userId": 2,
  "username": "user",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### 6. **SQLite Browser**
   - [DB Browser for SQLite](https://sqlitebrowser.org/)
   - Inspect `database.db` file
   - View/modify data directly
   - Understand data structure dan relationships
   - Execute custom SQL queries

## 🎓 Learning Path

### Level 1: Understand the Vulnerabilities
1. Baca dokumentasi setiap skenario
2. Pahami perbedaan antara SSR, CSR, dan Forced Browsing
3. Pelajari cara kerja JWT dan session management

### Level 2: Exploit the Vulnerabilities
1. Login sebagai user biasa
2. Coba akses setiap skenario dari user dashboard
3. Gunakan DevTools untuk inspect requests/responses
4. Practice intercept dan modify data

### Level 3: Fix the Vulnerabilities
1. Identifikasi root cause dari setiap vulnerability
2. Implement proper authorization checks
3. Test bahwa fix bekerja dengan baik
4. Understand defense-in-depth principles

## 🐛 Troubleshooting

### Port sudah digunakan
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Database error / corrupt
```bash
# Hapus database dan restart (akan di-recreate otomatis)
rm database.db
npm run dev
```

### JWT token expired
- Token berlaku 24 jam
- Logout dan login kembali untuk mendapat token baru
- Atau clear browser cookies

### Cannot read property of undefined
- Pastikan database sudah ter-initialize
- Check console untuk error messages
- Restart development server

## 💡 FAQ (Frequently Asked Questions)

### Q: Mengapa ada banyak endpoint terpisah (v0.0, v0.1, v1.1, dll)?
**A:** Setiap scenario memiliki endpoint terpisah untuk menghindari tabrakan vulnerability. Ini memastikan setiap scenario bisa didemonstrasikan secara independent tanpa mempengaruhi yang lain.

### Q: Apakah aman untuk menjalankan aplikasi ini di komputer saya?
**A:** Ya, selama hanya dijalankan di `localhost` dan tidak di-expose ke network. Aplikasi ini dibuat untuk pembelajaran lokal saja.

### Q: Bagaimana cara reset database ke keadaan awal?
**A:** Hapus file `database.db` dan restart aplikasi. Database akan di-recreate dengan data default.

### Q: Kenapa menggunakan JWT dengan secret yang weak?
**A:** Untuk tujuan edukasi. Di production, gunakan strong secret (32+ characters random string) dan simpan di environment variables.

### Q: Apakah UUID benar-benar tidak aman?
**A:** UUID sendiri aman sebagai identifier format. Yang tidak aman adalah:
1. Mengexpose UUID di public API responses
2. Menggunakan UUID tanpa proper authorization checks
3. Berpikir UUID = security (authorization tetap dibutuhkan)

### Q: Bagaimana cara menambahkan scenario baru?
**A:**
1. Buat folder baru di `app/api/vX.X/`
2. Buat page baru di `app/user/scenario-X.X/`
3. Tambahkan dokumentasi di README
4. Update navigation di user dashboard

### Q: Kenapa ada 2 folder galeri (`galeri` dan `gallery`)?
**A:** `galeri` adalah nama konsisten yang digunakan (bahasa Indonesia), `gallery` mungkin alias atau legacy - gunakan `galeri` untuk konsistensi.

## ⚠️ Disclaimer

**PENTING**: Aplikasi ini SENGAJA dibuat vulnerable untuk tujuan edukasi. JANGAN deploy aplikasi ini ke production atau environment yang bisa diakses publik.

**Vulnerability yang ada di aplikasi ini untuk pembelajaran:**
- Bagaimana BAC dan ATO terjadi dalam real-world scenarios
- Cara mengidentifikasi vulnerability melalui code review dan testing
- Cara exploit vulnerability menggunakan berbagai tools
- Cara memperbaiki vulnerability dengan proper security controls
- Perbedaan antara authentication dan authorization
- Pentingnya defense-in-depth dan server-side validation

**Ethical Use Only:**
- Gunakan hanya untuk pembelajaran dan training di controlled environment
- Jangan gunakan knowledge ini untuk illegal activities
- Jangan test pada aplikasi yang bukan milik Anda tanpa permission
- Selalu practice responsible disclosure jika menemukan vulnerability

**Production Security Checklist:**
- ✅ Use strong JWT secret (environment variable)
- ✅ Implement proper authorization di SEMUA endpoints
- ✅ Don't expose internal IDs/UUIDs
- ✅ Require current password for sensitive operations
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Add logging dan monitoring
- ✅ Regular security audits
- ✅ Keep dependencies updated
- ✅ Use secure session management

## 📖 Referensi & Learning Resources

### OWASP Resources
- [OWASP Top 10 - A01:2021 Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [OWASP Testing Guide - Authorization Testing](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/)
- [OWASP Cheat Sheet - Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP Cheat Sheet - Insecure Direct Object References](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)

### CWE References
- [CWE-639: Authorization Bypass Through User-Controlled Key](https://cwe.mitre.org/data/definitions/639.html)
- [CWE-284: Improper Access Control](https://cwe.mitre.org/data/definitions/284.html)
- [CWE-862: Missing Authorization](https://cwe.mitre.org/data/definitions/862.html)
- [CWE-863: Incorrect Authorization](https://cwe.mitre.org/data/definitions/863.html)

### Additional Learning
- [PortSwigger - Access Control Vulnerabilities](https://portswigger.net/web-security/access-control)
- [PortSwigger Academy - All Access Control Labs](https://portswigger.net/web-security/all-labs#access-control-vulnerabilities)
- [NIST - Access Control Guidelines](https://csrc.nist.gov/projects/access-control-policy-tool)
- [HackerOne - Top Access Control Reports](https://www.hackerone.com/vulnerability-types/improper-access-control)

### Next.js Security
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Next.js Authentication Patterns](https://nextjs.org/docs/app/building-your-application/authentication)

### Tools Documentation
- [Burp Suite Documentation](https://portswigger.net/burp/documentation)
- [OWASP ZAP User Guide](https://www.zaproxy.org/docs/)
- [JWT.io - JSON Web Token Debugger](https://jwt.io/)

## 🤝 Contributing

Ini adalah project edukasi. Jika Anda ingin menambahkan scenario baru atau memperbaiki dokumentasi:

1. Fork repository
2. Buat branch baru (`git checkout -b feature/scenario-baru`)
3. Commit changes (`git commit -m 'Add new scenario'`)
4. Push to branch (`git push origin feature/scenario-baru`)
5. Open Pull Request

## 📧 Contact & Support

Jika menemukan bug atau memiliki pertanyaan:
- Open issue di GitHub repository
- Email: [your-email@example.com]
- Discussion: GitHub Discussions

## 📝 License

MIT License - Educational purposes only

```
Copyright (c) 2025 BAC Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction for EDUCATIONAL PURPOSES ONLY, including
without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense copies of the Software, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED. THE SOFTWARE SHALL NOT BE USED FOR MALICIOUS PURPOSES OR DEPLOYED
TO PRODUCTION ENVIRONMENTS.
```

## 🏆 Acknowledgments

- **OWASP** - For comprehensive security resources
- **PortSwigger** - For excellent learning materials
- **Next.js Team** - For amazing framework
- **Security Community** - For continuous education

---

**Created for Security Education & Training**

**Version**: 2.0 - Separated API endpoints per scenario

**Last Updated**: 2025-10-17

**Status**: ✅ Production-ready for educational environments

**Git**: Initial commit (0c9e3af) - Clean repository

---

## 🎯 Quick Start Summary

```bash
# 1. Install
npm install

# 2. Run
npm run dev

# 3. Login
Username: user / Password: user123

# 4. Explore Scenarios
Navigate to /user/dashboard and select scenarios
```

**Happy Learning! Stay Ethical! 🛡️**
