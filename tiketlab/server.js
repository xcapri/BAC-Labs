#!/usr/bin/env node
/*
 * TiketLab API - workshop security challenge target
 * --------------------------------------------------
 * Intentionally vulnerable. Run it on localhost or an isolated workshop LAN only.
 *
 *   node server.js                     -> http://127.0.0.1:4000
 *   HOST=0.0.0.0 PORT=4000 node server.js   (instructor-hosted, shared on the LAN)
 *
 * No npm install needed. Requires Node.js 18 or newer.
 * State lives in memory: restart the process to reset everything.
 *
 * Flags can be changed per event with FLAG1..FLAG4 environment variables.
 * Participants should treat this file as a black box. Do not distribute it
 * before the challenge if you host the target yourself.
 */
'use strict';

const http = require('http');
const crypto = require('crypto');
const { URL } = require('url');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = parseInt(process.env.PORT || '4000', 10);

const FLAGS = {
  f1: process.env.FLAG1 || 'FLAG{debug_endpoints_ship_to_prod}',
  f2: process.env.FLAG2 || 'FLAG{v1_never_really_died}',
  f3: process.env.FLAG3 || 'FLAG{role_is_not_a_profile_field}',
  f4: process.env.FLAG4 || 'FLAG{reset_tokens_belong_in_email}',
};

// ---------------------------------------------------------------- data store
const hash = (pw) => crypto.createHash('sha256').update('tiketlab:' + pw).digest('hex');
const now = () => new Date().toISOString();

const users = new Map();     // id -> user
const sessions = new Map();  // token -> userId
const resetTokens = new Map(); // userId -> token
const tickets = new Map();   // id -> ticket
let nextUserId = 1;
let nextTicketId = 1001;

function createUser({ username, password, display_name, email, phone, role, internal_note }) {
  const u = {
    id: nextUserId++,
    username,
    password_hash: hash(password),
    display_name: display_name || username,
    email: email || `${username}@tiketlab.test`,
    phone: phone || '',
    role: role || 'attendee',
    created_at: now(),
  };
  if (internal_note) u.internal_note = internal_note;
  users.set(u.id, u);
  return u;
}

function createTicket(owner, type, notes) {
  const t = {
    id: nextTicketId++,
    event_id: 1,
    owner_id: owner.id,
    type,
    seat: type === 'ORGANIZER' ? 'STAFF' : 'GA-' + String(Math.floor(Math.random() * 400) + 1).padStart(3, '0'),
    notes,
    issued_at: now(),
  };
  tickets.set(t.id, t);
  return t;
}

const events = [
  { id: 1, name: 'Web & API Security Workshop', date: '2026-11-21', venue: 'Main Hall', quota: 60 },
];

const vouchers = [
  { id: 1, event_id: 1, code: 'EARLYBIRD-25', discount_percent: 25, created_by: 'panitia' },
];

// seed accounts (passwords are random; nobody is meant to log in as them directly)
const organizer = createUser({
  username: 'panitia',
  password: crypto.randomBytes(12).toString('hex'),
  display_name: 'Panitia Workshop',
  phone: '+62-812-0000-0001',
  role: 'organizer',
  internal_note: FLAGS.f4,
});
createTicket(organizer, 'ORGANIZER', 'Backstage access. Internal ref: ' + FLAGS.f2);
for (const name of ['rina', 'budi', 'sari']) {
  const u = createUser({ username: name, password: crypto.randomBytes(12).toString('hex') });
  createTicket(u, 'REGULAR', '');
}

// ------------------------------------------------------------------ helpers
function send(res, status, body, headers = {}) {
  const isString = typeof body === 'string';
  res.writeHead(status, {
    'Content-Type': isString ? (headers['Content-Type'] || 'text/html; charset=utf-8') : 'application/json',
    'X-Powered-By': 'TiketLab/2.3.1',
    ...headers,
  });
  res.end(isString ? body : JSON.stringify(body, null, 2));
}

function readJson(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 1e5) req.destroy();
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        const parsed = JSON.parse(data);
        resolve(parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : { __invalid: true });
      } catch {
        resolve({ __invalid: true });
      }
    });
  });
}

function currentUser(req) {
  const auth = req.headers['authorization'] || '';
  const m = auth.match(/^Bearer\s+([a-f0-9]{40})$/i);
  if (!m) return null;
  const uid = sessions.get(m[1].toLowerCase());
  return uid ? users.get(uid) : null;
}

function publicUser(u) {
  const { password_hash, ...rest } = u;
  return rest;
}

function ticketV2(t) {
  return { id: t.id, event_id: t.event_id, type: t.type, seat: t.seat, issued_at: t.issued_at };
}

// ------------------------------------------------------------- static files
const INDEX_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>TiketLab</title>
<style>
 body{font-family:"Courier New",monospace;background:#009D81;margin:0;padding:24px;color:#000}
 .win{max-width:720px;margin:0 auto;background:#fff;border:2px solid #000}
 .bar{background:#088C9C;color:#fff;font-weight:bold;padding:8px 12px;border-bottom:2px solid #000}
 .body{padding:16px} input,button{font-family:inherit;font-size:14px;padding:6px;margin:4px 0}
 button{background:#C0C0C0;border:2px solid #000;cursor:pointer} pre{background:#1E1E1E;color:#ddd;padding:10px;overflow:auto}
 .row{display:flex;gap:16px;flex-wrap:wrap} .row>div{flex:1;min-width:240px}
</style></head><body>
<div class="win"><div class="bar">TiketLab - Event Tickets</div><div class="body">
 <div id="auth" class="row">
  <div><b>Login</b><br><input id="lu" placeholder="username"><br><input id="lp" type="password" placeholder="password"><br><button onclick="doLogin()">Login</button></div>
  <div><b>Register</b><br><input id="ru" placeholder="username"><br><input id="rp" type="password" placeholder="password"><br><button onclick="doRegister()">Register</button></div>
 </div>
 <div id="app" style="display:none">
  <p>Signed in as <b id="who"></b> <button onclick="logout()">Logout</button></p>
  <b>My tickets</b><pre id="tix">loading...</pre>
  <b>Profile</b><br><input id="dn" placeholder="display name"> <input id="ph" placeholder="phone"> <button onclick="saveProfile()">Save</button>
 </div>
 <p id="msg"></p>
</div></div>
<script src="/static/app.js"></script>
</body></html>`;

const APP_JS = `// TiketLab web client v2.3.1
const API = '/api/v2';

const ENDPOINTS = {
  register: API + '/auth/register',
  login: API + '/auth/login',
  me: API + '/users/me',
  myTickets: API + '/tickets',
  ticket: (id) => API + '/tickets/' + id,
  docs: '/api/docs/openapi.json',
  // debugConfig: API + '/_debug/config',   // TODO(andi): remove before go-live, only for staging
};

let token = sessionStorage.getItem('tl_token');

async function call(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function doRegister() {
  const r = await call(ENDPOINTS.register, { method: 'POST', body: JSON.stringify({ username: ru.value, password: rp.value }) });
  msg.textContent = r.status === 201 ? 'Registered. You can log in now.' : (r.body.error || 'Registration failed');
}

async function doLogin() {
  const r = await call(ENDPOINTS.login, { method: 'POST', body: JSON.stringify({ username: lu.value, password: lp.value }) });
  if (r.status !== 200) { msg.textContent = r.body.error || 'Login failed'; return; }
  token = r.body.token; sessionStorage.setItem('tl_token', token); load();
}

function logout() { sessionStorage.removeItem('tl_token'); token = null; location.reload(); }

async function saveProfile() {
  const r = await call(ENDPOINTS.me, { method: 'PATCH', body: JSON.stringify({ display_name: dn.value, phone: ph.value }) });
  msg.textContent = r.status === 200 ? 'Profile saved.' : (r.body.error || 'Update failed');
}

async function load() {
  if (!token) return;
  const me = await call(ENDPOINTS.me);
  if (me.status !== 200) { logout(); return; }
  auth.style.display = 'none'; app.style.display = 'block';
  who.textContent = me.body.display_name + ' (' + me.body.username + ')';
  dn.value = me.body.display_name || ''; ph.value = me.body.phone || '';
  const t = await call(ENDPOINTS.myTickets);
  tix.textContent = JSON.stringify(t.body, null, 2);
}

load();
`;

const OPENAPI = {
  openapi: '3.0.3',
  info: {
    title: 'TiketLab API',
    version: '2.3.1',
    description: 'Public API for the TiketLab web client. Authenticate with POST /auth/login and send the token as "Authorization: Bearer <token>".',
  },
  servers: [{ url: '/api/v2' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } },
    schemas: {
      Credentials: { type: 'object', required: ['username', 'password'], properties: { username: { type: 'string' }, password: { type: 'string' } } },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' }, username: { type: 'string' }, display_name: { type: 'string' },
          email: { type: 'string' }, phone: { type: 'string' }, role: { type: 'string' }, created_at: { type: 'string' },
        },
      },
      UserUpdate: { type: 'object', properties: { display_name: { type: 'string' }, phone: { type: 'string' } } },
      Ticket: {
        type: 'object',
        properties: { id: { type: 'integer' }, event_id: { type: 'integer' }, type: { type: 'string' }, seat: { type: 'string' }, issued_at: { type: 'string' } },
      },
    },
  },
  paths: {
    '/auth/register': { post: { summary: 'Create an attendee account', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Credentials' } } } }, responses: { 201: { description: 'Created' } } } },
    '/auth/login': { post: { summary: 'Log in and receive a bearer token', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Credentials' } } } }, responses: { 200: { description: 'OK' } } } },
    '/auth/forgot-password': { post: { summary: 'Start password reset. A reset token is sent to the account email.', requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' } } } } } }, responses: { 200: { description: 'OK' } } } },
    '/auth/reset-password': { post: { summary: 'Finish password reset with the token from the email', requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, token: { type: 'string' }, new_password: { type: 'string' } } } } } }, responses: { 200: { description: 'OK' } } } },
    '/users/me': {
      get: { summary: 'Current user profile', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } } } },
      patch: { summary: 'Update display name or phone', security: [{ bearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UserUpdate' } } } }, responses: { 200: { description: 'OK' } } },
    },
    '/tickets': { get: { summary: 'List my tickets', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } } },
    '/tickets/{id}': { get: { summary: 'Get one of my tickets', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' }, 403: { description: 'Not your ticket' } } } },
    '/events': { get: { summary: 'List events', responses: { 200: { description: 'OK' } } } },
    '/organizer/report': { get: { summary: 'Attendance report. Organizer role only.', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' }, 403: { description: 'Organizer role required' } } } },
  },
};

// ------------------------------------------------------------------- routes
async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const method = req.method.toUpperCase();
  let m;

  // static
  if (method === 'GET' && path === '/') return send(res, 200, INDEX_HTML);
  if (method === 'GET' && path === '/static/app.js') return send(res, 200, APP_JS, { 'Content-Type': 'application/javascript; charset=utf-8' });
  if (method === 'GET' && path === '/api/docs/openapi.json') return send(res, 200, OPENAPI);

  // FLAG 1 - API8/API9: staging debug endpoint left reachable, no auth
  if (method === 'GET' && path === '/api/v2/_debug/config') {
    return send(res, 200, {
      env: 'staging',
      build: '2.3.1+gitc0ffee',
      debug: true,
      flag: FLAGS.f1,
      db: { host: '10.20.0.12', name: 'tiketlab', user: 'tiketlab_app' },
      legacy_api: {
        enabled: true,
        base: '/api/v1',
        reason: 'mobile app 1.x still calls GET /api/v1/tickets/{id}',
        sunset: 'TBD',
      },
      password_reset: { email_delivery: false, return_token_in_response: true },
    });
  }

  // auth
  if (method === 'POST' && path === '/api/v2/auth/register') {
    const b = await readJson(req);
    if (b.__invalid) return send(res, 400, { error: 'invalid JSON body' });
    const username = String(b.username || '').trim();
    const password = String(b.password || '');
    if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(username)) return send(res, 400, { error: 'username must be 3-24 chars: letters, digits, _ . -' });
    if (password.length < 6) return send(res, 400, { error: 'password must be at least 6 characters' });
    if ([...users.values()].some((u) => u.username.toLowerCase() === username.toLowerCase())) return send(res, 409, { error: 'username already taken' });
    const u = createUser({ username, password }); // role defaults to attendee
    const t = createTicket(u, 'REGULAR', '');
    return send(res, 201, { id: u.id, username: u.username, ticket_id: t.id });
  }

  if (method === 'POST' && path === '/api/v2/auth/login') {
    const b = await readJson(req);
    const u = [...users.values()].find((x) => x.username === b.username);
    if (!u || u.password_hash !== hash(String(b.password || ''))) return send(res, 401, { error: 'invalid username or password' });
    const token = crypto.randomBytes(20).toString('hex');
    sessions.set(token, u.id);
    return send(res, 200, { token, token_type: 'Bearer', expires_in: 7200 });
  }

  // BONUS - API2: reset token returned in the API response
  if (method === 'POST' && path === '/api/v2/auth/forgot-password') {
    const b = await readJson(req);
    const u = [...users.values()].find((x) => x.username === b.username);
    const body = { message: 'If the account exists, a reset link has been sent to the registered email.' };
    if (u) {
      const tok = crypto.randomBytes(16).toString('hex');
      resetTokens.set(u.id, tok);
      body.debug = { reset_token: tok }; // "staging only", per the developer
    }
    return send(res, 200, body);
  }

  if (method === 'POST' && path === '/api/v2/auth/reset-password') {
    const b = await readJson(req);
    const u = [...users.values()].find((x) => x.username === b.username);
    if (!u || !resetTokens.has(u.id) || resetTokens.get(u.id) !== b.token) return send(res, 400, { error: 'invalid or expired reset token' });
    if (String(b.new_password || '').length < 6) return send(res, 400, { error: 'new_password must be at least 6 characters' });
    u.password_hash = hash(String(b.new_password));
    resetTokens.delete(u.id);
    return send(res, 200, { message: 'password updated' });
  }

  if (method === 'GET' && path === '/api/v2/events') return send(res, 200, { events });

  // everything below requires a valid bearer token
  const me = currentUser(req);
  const needsAuth = path.startsWith('/api/v1/') || path.startsWith('/api/v2/');
  if (needsAuth && !me) return send(res, 401, { error: 'missing or invalid bearer token' });

  if (path === '/api/v2/users/me') {
    if (method === 'GET') return send(res, 200, publicUser(me));
    if (method === 'PATCH' || method === 'PUT') {
      const b = await readJson(req);
      if (b.__invalid) return send(res, 400, { error: 'invalid JSON body' });
      // FLAG 3 - API3 mass assignment: every existing column except a short denylist is writable
      const locked = ['id', 'username', 'password_hash', 'created_at'];
      for (const [k, v] of Object.entries(b)) {
        if (locked.includes(k)) continue;
        if (!Object.prototype.hasOwnProperty.call(me, k)) continue;
        if (k === 'role' && !['attendee', 'organizer'].includes(v)) {
          return send(res, 400, { error: 'invalid value for role', allowed: ['attendee', 'organizer'] });
        }
        if (typeof v !== 'string' || v.length > 80) return send(res, 400, { error: `invalid value for ${k}` });
        me[k] = v;
      }
      return send(res, 200, publicUser(me));
    }
    return send(res, 405, { error: 'method not allowed' });
  }

  if (method === 'GET' && path === '/api/v2/tickets') {
    return send(res, 200, { tickets: [...tickets.values()].filter((t) => t.owner_id === me.id).map(ticketV2) });
  }

  // v2: object-level check is in place
  if (method === 'GET' && (m = path.match(/^\/api\/v2\/tickets\/(\d+)$/))) {
    const t = tickets.get(parseInt(m[1], 10));
    if (!t) return send(res, 404, { error: 'ticket not found' });
    if (t.owner_id !== me.id) return send(res, 403, { error: 'you do not own this ticket' });
    return send(res, 200, ticketV2(t));
  }

  // FLAG 2 - API1 + API9: legacy v1 route never got the ownership check
  if (method === 'GET' && (m = path.match(/^\/api\/v1\/tickets\/(\d+)$/))) {
    const t = tickets.get(parseInt(m[1], 10));
    if (!t) return send(res, 404, { error: 'ticket not found' });
    const owner = users.get(t.owner_id);
    return send(res, 200, {
      ...t,
      owner: { username: owner.username, display_name: owner.display_name, email: owner.email, phone: owner.phone },
    });
  }

  if (method === 'GET' && path === '/api/v2/organizer/report') {
    if (me.role !== 'organizer') return send(res, 403, { error: 'organizer role required' });
    return send(res, 200, {
      event_id: 1,
      registered: users.size - 1,
      tickets_issued: tickets.size,
      vouchers,
      flag: FLAGS.f3,
    });
  }

  if (path.startsWith('/api/')) return send(res, 404, { error: 'not found' });
  return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((err) => {
    console.error(err);
    send(res, 500, { error: 'internal error' });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`TiketLab challenge API listening on http://${HOST}:${PORT}`);
  console.log('Intentionally vulnerable. Keep it on localhost or an isolated workshop network.');
});
