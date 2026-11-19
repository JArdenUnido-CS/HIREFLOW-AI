import { Router } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/AuthService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', { email: req.body.email, hasPassword: !!req.body.password });
    const { email, password } = loginSchema.parse(req.body);
    console.log('Login schema validated:', { email });
    const authResponse = await AuthService.login(email, password);
    console.log('Login successful, sending response');
    res.json(authResponse);
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      console.error('Validation error details:', error.errors);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    const message = error instanceof Error ? error.message : 'Login failed';
    res.status(401).json({ error: message });
  }
});

/**
 * POST /api/auth/register
 * Register a new user account (Candidate)
 * Automatically creates a candidate record visible to admins
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    
    // Register user with 'candidate' role
    const authResponse = await AuthService.register(email, name, password, 'candidate');
    
    // Auto-create candidate record (visible to admin) - but don't block if it fails
    try {
      const { CandidateRepository } = await import('../repositories/index.js');
      const { generateId } = await import('../utils/helpers.js');
      
      await CandidateRepository.create(generateId(), {
        name,
        email,
        status: 'applied',
        applied_at: new Date(),
      });
    } catch (candidateError) {
      // Log but don't fail registration if candidate record creation fails
      console.error('Failed to create candidate record:', candidateError);
    }

    res.status(201).json(authResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    const message = error instanceof Error ? error.message : 'Registration failed';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    const response = AuthService.refreshToken(refreshToken);
    res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    res.status(401).json({ error: message });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    // User info is already in req.user from middleware
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * POST /api/auth/logout
 * Logout (client-side token deletion, server doesn't maintain session)
 */
router.post('/logout', authenticate, (req, res) => {
  // With JWT, logout is handled client-side by deleting the token
  res.json({ message: 'Logged out successfully' });
});

/**
 * PATCH /api/auth/profile
 * Update user profile information
 */
router.patch('/profile', authenticate, async (req, res) => {
  try {
    if (!req.user || !req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name, department } = req.body;
    
    // Validate inputs
    if (name && typeof name !== 'string') {
      return res.status(400).json({ error: 'Name must be a string' });
    }
    if (department && typeof department !== 'string') {
      return res.status(400).json({ error: 'Department must be a string' });
    }

    // Import repository
    const { UserRepository } = await import('../repositories/index.js');

    // Update user
    const updateData: any = {};
    if (name) updateData.name = name;
    if (department !== undefined) updateData.department = department;

    const updatedUser = await UserRepository.update(req.userId, updateData);

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      department: updatedUser.department,
    });
  } catch (error) {
    console.error('Failed to update profile:', error);
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    res.status(500).json({ error: message });
  }
});

export { router as authRouter };
