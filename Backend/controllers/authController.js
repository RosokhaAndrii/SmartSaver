import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../database.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '7d';

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    await query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', 
      [name, email, password_hash]);
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    const rows = await query('SELECT id, name, email, password_hash FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.json({ accessToken: token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
}

export async function me(req, res) {
  const userId = req.userId; 
  try {
    const rows = await query('SELECT id, name, email FROM users WHERE id = ?', [userId]);
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
}