import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;

export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    console.log('authMiddleware: missing Authorization header');
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    console.log('authMiddleware: token valid for user', req.userId);
    next();
  } catch (err) {
    console.error('authMiddleware: token verify failed', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
}
