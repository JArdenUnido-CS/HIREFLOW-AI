import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'hireflow-dev-secret-key-change-in-production';

// In-memory store for demo purposes
const users = new Map<string, { id: string; email: string; name: string; password: string; role: string }>();

// Seed demo user
const demoPasswordHash = bcrypt.hashSync('password123', 10);
users.set('JardenUnido@hireflow.ai', {
  id: 'usr_01',
  email: 'JardenUnido@hireflow.ai',
  name: 'Jem Arden Unido',
  password: demoPasswordHash,
  role: 'admin',
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = users.get(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    if (users.has(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = `usr_${Date.now().toString(36)}`;
    
    users.set(email, { id, email, name, password: hashedPassword, role: 'recruiter' });

    const token = jwt.sign({ userId: id, email, role: 'recruiter' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id, email, name, role: 'recruiter' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };
    const token = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export { router as authRouter };
