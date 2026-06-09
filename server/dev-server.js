import http from 'http';
import { URL } from 'url';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString();
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function createRes(res) {
  return {
    statusCode: 200,
    setHeader(k, v) {
      res.setHeader(k, v);
    },
    end(data) {
      res.statusCode = this.statusCode;
      res.end(data);
    },
  };
}

const routes = [
  { method: 'POST', path: '/api/auth/login', handler: () => import('../api/auth/login.js') },
  { method: 'POST', path: '/api/auth/logout', handler: () => import('../api/auth/logout.js') },
  { method: 'GET', path: '/api/auth/me', handler: () => import('../api/auth/me.js') },
  { method: 'GET', path: '/api/leads', handler: () => import('../api/leads/index.js') },
  { method: 'POST', path: '/api/leads', handler: () => import('../api/leads/index.js') },
];

function matchLeadId(pathname) {
  const m = pathname.match(/^\/api\/leads\/([^/]+)$/);
  return m ? m[1] : null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;
  req.query = Object.fromEntries(url.searchParams);

  const leadId = matchLeadId(pathname);
  if (leadId) {
    req.query.id = leadId;
    const mod = await import('../api/leads/[id].js');
    const nodeRes = createRes(res);
    req.body = await readBody(req);
    await mod.default(req, nodeRes);
    return;
  }

  const route = routes.find((r) => r.method === req.method && r.path === pathname);
  if (!route) {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }
  const mod = await route.handler();
  const nodeRes = createRes(res);
  req.body = await readBody(req);
  await mod.default(req, nodeRes);
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`API dev server http://localhost:${PORT}`);
});
