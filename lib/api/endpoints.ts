/**
 * API Endpoints Configuration
 *
 * VULNERABILITY: This file exposes internal API endpoints to client-side!
 * File ini akan di-bundle ke client-side JavaScript dan bisa dilihat di DevTools
 *
 * Security Issue:
 * - Internal admin endpoints exposed in public JavaScript bundle
 * - Request payload structure visible to attackers
 * - Available parameters and roles documented in client code
 *
 * Attack Vector:
 * 1. Open Browser DevTools (F12)
 * 2. Go to Sources/Debugger tab
 * 3. Search for "endpoints.ts" or "api/users"
 * 4. Find API_ENDPOINTS configuration
 * 5. See complete endpoint details including admin operations
 */

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },

  // VULNERABILITY: Admin endpoint exposed in client-side bundle!
  users: {
    // Create user endpoint - SHOULD BE ADMIN ONLY but exposed here!
    create: '/api/users',
    list: '/api/users',
    getById: (id: string) => `/api/users/${id}`,
    update: (id: string) => `/api/users/${id}`,
    delete: (id: string) => `/api/users/${id}`,

    // CRITICAL: Request payload structure exposed!
    schema: {
      create: {
        username: 'string (required)',
        password: 'string (required)',
        role: 'user | admin', // EXPOSED: Attacker can see admin role is available!
      },
      update: {
        username: 'string (optional)',
        password: 'string (optional)',
        role: 'user | admin',
      },
    },
  },

  news: {
    list: '/api/news',
    create: '/api/news',
    getById: (id: string) => `/api/news/${id}`,
    update: (id: string) => `/api/news/${id}`,
    approve: (id: string) => `/api/news/${id}/approve`,
  },

  galeri: {
    list: '/api/galeri',
    create: '/api/galeri',
    getById: (id: string) => `/api/galeri/${id}`,
    update: (id: string) => `/api/galeri/${id}`,
    approve: (id: string) => `/api/galeri/${id}/approve`,
  },
};

// VULNERABILITY: Example API calls exposed in client code!
// Attackers can copy-paste these examples
export const API_EXAMPLES = {
  // Example: How to create a new user (SHOULD BE HIDDEN!)
  createUser: {
    endpoint: API_ENDPOINTS.users.create,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      username: 'newuser',
      password: 'password123',
      role: 'user', // Attacker can change this to 'admin'!
    },
    // CRITICAL: Even shows how to create admin!
    adminExample: {
      username: 'admin2',
      password: 'changeme123',
      role: 'admin', // EXPOSED: Shows how to create admin account!
    },
  },

  createNews: {
    endpoint: API_ENDPOINTS.news.create,
    method: 'POST',
    body: {
      title: 'News Title',
      content: 'News content...',
    },
  },
};

// VULNERABILITY: Helper function that shows exact API call structure
export async function createUser(username: string, password: string, role: 'user' | 'admin' = 'user') {
  // This function is visible in DevTools and shows:
  // 1. Exact endpoint path
  // 2. Request structure
  // 3. That it accepts 'admin' role
  // 4. No authentication token required!

  const response = await fetch(API_ENDPOINTS.users.create, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // VULNERABILITY: No authentication header!
      // In secure code, should have: 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      username,
      password,
      role, // EXPOSED: Shows role parameter exists and accepts admin!
    }),
  });

  return response.json();
}

// Log endpoints for "debugging" - makes it even easier for attackers to find
if (typeof window !== 'undefined') {
  // VULNERABILITY: Logging API config to console in production!
  console.log('🔧 API Endpoints:', API_ENDPOINTS);
  console.log('📝 API Examples:', API_EXAMPLES);

  // Make it globally accessible - worst practice!
  (window as any).__API_CONFIG__ = {
    endpoints: API_ENDPOINTS,
    examples: API_EXAMPLES,
  };
}
