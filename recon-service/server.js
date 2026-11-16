#!/usr/bin/env node
// =============================================================================
//  Legacy Report Service — second, deliberately-vulnerable lab target
//  (recon exercise). Zero dependencies, Node 18+.
//
//  Teaching points:
//    1. Recon / attack surface: this service listens on a SECOND port (3001)
//       that the participant must discover with nmap / port scanning. The main
//       lab (BAC-Labs) only listens on 3000.
//    2. Security misconfiguration (OWASP A06 / A05:2025): DEBUG is left enabled.
//       Any unhandled exception renders a full debug page that dumps the runtime
//       config — which contains the low and admin credentials and the DB password.
//    3. Broken authentication flow (only as a consequence): the leaked admin
//       password can then be used on the /login page to reach the admin dashboard.
//
//  Run:
//     node recon-service/server.js       (or: npm run recon)
//     PORT=3001 HOST=0.0.0.0 node recon-service/server.js
//
//  Intentionally vulnerable. Keep on localhost / an isolated workshop network.
// =============================================================================

const http = require('http');

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Runtime config. This is what the debug page leaks.
const config = {
  service: 'legacy-report-service',
  version: '1.4.2',
  environment: 'development',   // should be 'production'
  debug: true,                  // should be false
  database: {
    host: '127.0.0.1',
    port: 5432,
    name: 'reports',
    user: 'report_app',
    password: 'pg_r3p0rt_$ecr3t',
  },
  users: {
    user:  { username: 'user',  password: 'user123',  role: 'user'  },
    admin: { username: 'admin', password: 'admin123', role: 'admin' },
  },
  reports: {
    JAN: { title: 'January sales report', owner: 'finance' },
    FEB: { title: 'February sales report', owner: 'finance' },
  },
};

const ADMIN_FLAG = 'FLAG{recon_debug_leak_admin}';

// ---------------------------------------------------------------------------
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function layout(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: #f4f5f7; color: #1f2933; }
  header { background: #14211c; color: #e2f7dd; padding: 14px 22px; display: flex; justify-content: space-between; align-items: center; }
  header .brand { font-weight: 700; letter-spacing: .3px; }
  header .tag { font-size: 12px; color: #9fb3a8; }
  main { max-width: 760px; margin: 28px auto; padding: 0 16px; }
  .card { background: #fff; border: 1px solid #dfe3e8; border-radius: 8px; padding: 22px; margin-bottom: 18px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
  h1 { font-size: 22px; margin: 0 0 12px; }
  h2 { font-size: 16px; margin: 0 0 10px; color: #14211c; }
  label { display: block; font-size: 13px; margin: 10px 0 4px; color: #486581; }
  input[type=text], input[type=password] { width: 100%; padding: 9px 10px; border: 1px solid #bcccdc; border-radius: 6px; font-size: 14px; }
  button { margin-top: 14px; background: #0b6e2e; color: #fff; border: 0; padding: 10px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; }
  a { color: #0b6e2e; }
  .muted { color: #627d98; font-size: 13px; }
  .err { color: #a61b1b; background: #fff0f0; border: 1px solid #ffd1d1; padding: 10px 12px; border-radius: 6px; font-size: 13px; margin: 10px 0; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e4e7eb; }
  th { color: #486581; font-weight: 600; }
  code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
  .flag { font-family: ui-monospace, Consolas, monospace; background: #14211c; color: #7ee787; padding: 8px 10px; border-radius: 6px; }
</style>
</head>
<body>
<header><span class="brand">legacy-report-service</span><span class="tag">v${esc(config.version)} · internal</span></header>
<main>${body}</main>
</body>
</html>`;
}

function home() {
  return layout('Legacy Report Service', `
    <div class="card">
      <h1>Legacy Report Service</h1>
      <p class="muted">Internal reporting tool. Kept running for a few older clients.</p>
      <p><a href="/login">Sign in</a> &nbsp;·&nbsp; <a href="/report?month=JAN">Latest report</a></p>
    </div>`);
}

function loginForm(err) {
  return layout('Sign in', `
    <div class="card">
      <h1>Sign in</h1>
      ${err ? `<div class="err">${esc(err)}</div>` : ''}
      <form method="post" action="/login">
        <label>Username</label>
        <input type="text" name="username" autocomplete="username">
        <label>Password</label>
        <input type="password" name="password" autocomplete="current-password">
        <button type="submit">Sign in</button>
      </form>
    </div>`);
}

function dashboard(user) {
  if (user.role === 'admin') {
    return layout('Admin dashboard', `
      <div class="card">
        <h1>Admin dashboard</h1>
        <p>Signed in as <strong>${esc(user.username)}</strong> (${esc(user.role)}). Full access.</p>
        <h2>Admin-only secret</h2>
        <div class="flag">${esc(ADMIN_FLAG)}</div>
        <h2 style="margin-top:18px">All reports</h2>
        <table>
          <tr><th>Month</th><th>Title</th><th>Owner</th></tr>
          ${Object.entries(config.reports).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v.title)}</td><td>${esc(v.owner)}</td></tr>`).join('')}
        </table>
      </div>`);
  }
  return layout('Dashboard', `
    <div class="card">
      <h1>Dashboard</h1>
      <p>Signed in as <strong>${esc(user.username)}</strong> (${esc(user.role)}).</p>
      <p class="muted">You have read-only access. The admin area is restricted to the admin account.</p>
      <p><a href="/report?month=JAN">View January report</a></p>
    </div>`);
}

// VULNERABLE: invalid month -> reports[month] is undefined -> TypeError -> debug page
function report(url) {
  const month = (url.searchParams.get('month') || '').toUpperCase();
  const r = config.reports[month];
  return layout(`Report — ${esc(r.title)}`, `
    <div class="card">
      <h1>${esc(r.title)}</h1>
      <p class="muted">Owner: ${esc(r.owner)}</p>
    </div>`);
}

function notFound() {
  return layout('Not found', `<div class="card"><h1>404</h1><p class="muted">No such resource.</p></div>`);
}

// ---------------------------------------------------------------------------
// DEBUG error page — leaks the runtime config (credentials + DB password).
function debugPage(err, req, url) {
  const stack = (err && err.stack) ? err.stack : String(err);
  // Redact the admin password: the debug page leaks the admin username (enough
  // for recon/mapping) but must not hand over admin access.
  const safeConfig = JSON.parse(JSON.stringify(config));
  if (safeConfig.users && safeConfig.users.admin) safeConfig.users.admin.password = '********';
  const configJson = JSON.stringify(safeConfig, null, 2);
  const headersJson = JSON.stringify(req.headers, null, 2);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc((err && err.name) || 'Error')} — legacy-report-service</title>
<style>
  body { margin: 0; background: #14121c; color: #e6edf3; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
  .top { background: #7a1f1f; padding: 18px 24px; }
  .top h1 { margin: 0; font-size: 20px; }
  .top .sub { color: #ffd7d7; font-size: 13px; margin-top: 6px; }
  .wrap { padding: 20px 24px; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: .6px; color: #9fb3c8; margin: 22px 0 8px; border-bottom: 1px solid #2a2735; padding-bottom: 6px; }
  pre { background: #0d0b14; border: 1px solid #2a2735; border-radius: 6px; padding: 14px; overflow-x: auto; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 13px; line-height: 1.5; margin: 0; }
  .conf pre { color: #a5d6ff; }
  .key { color: #d2a8ff; }
  .warn { color: #f2b33d; font-size: 13px; }
</style>
</head>
<body>
  <div class="top">
    <h1>${esc((err && err.name) || 'Error')}: ${esc((err && err.message) || String(err))}</h1>
    <div class="sub">legacy-report-service · environment: <b>development</b> · debug: <b>true</b></div>
  </div>
  <div class="wrap">
    <p class="warn">Debug mode is enabled. This page should not be shown in production.</p>

    <h2>Stack trace</h2>
    <pre>${esc(stack)}</pre>

    <h2>Runtime configuration</h2>
    <div class="conf"><pre>${esc(configJson)}</pre></div>

    <h2>Request</h2>
    <pre>${esc(req.method)} ${esc(url.pathname + url.search)}

${esc(headersJson)}</pre>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => resolve(data));
  });
}

function parseForm(body) {
  const out = {};
  for (const pair of body.split('&')) {
    const i = pair.indexOf('=');
    if (i > 0) out[decodeURIComponent(pair.slice(0, i))] = decodeURIComponent(pair.slice(i + 1).replace(/\+/g, ' '));
  }
  return out;
}

function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(home());
    }
    if (url.pathname === '/login') {
      if (req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(loginForm());
      }
      if (req.method === 'POST') {
        const form = parseForm(await readBody(req));
        const user = Object.values(config.users).find((u) => u.username === form.username);
        if (user && user.password === form.password) {
          res.writeHead(302, {
            'Set-Cookie': `session=${encodeURIComponent(user.username)}; Path=/; HttpOnly; SameSite=Lax`,
            Location: '/dashboard',
          });
          return res.end();
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(loginForm('Invalid username or password'));
      }
    }
    if (url.pathname === '/dashboard') {
      const ck = parseCookies(req);
      const user = Object.values(config.users).find((u) => u.username === ck.session);
      if (!user) {
        res.writeHead(302, { Location: '/login' });
        return res.end();
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(dashboard(user));
    }
    if (url.pathname === '/report') {
      // Compute first: report(url) throws on an invalid month, which must be
      // caught below and turned into the 500 debug page (headers not yet sent).
      const html = report(url);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    }
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(notFound());
  } catch (err) {
    // VULNERABLE: DEBUG enabled — render the full debug page (leaks config).
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    }
    res.end(debugPage(err, req, url));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`legacy-report-service listening on http://${HOST}:${PORT}`);
  console.log('DEBUG enabled — unhandled errors dump the runtime config (credentials included).');
});
