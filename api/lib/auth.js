import jwt from 'jsonwebtoken';

export function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-only-change-in-production';
}

export function verifyCredentials(username, password) {
  const adminUser = process.env.ADMIN_USERNAME || 'v3dentalclinic@gmail.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'v3clinic@123';
  return username === adminUser && password === adminPass;
}

/** Shared clinic login — any team member uses the same username and password. */
export function issueToken(username) {
  const token = jwt.sign({ sub: username, role: 'admin' }, getJwtSecret(), {
    expiresIn: '7d',
  });
  return token;
}

export function authenticateRequest(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, getJwtSecret());
    return { ok: true, user: payload.sub };
  } catch {
    return { ok: false, status: 401, error: 'Invalid token' };
  }
}

export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}
