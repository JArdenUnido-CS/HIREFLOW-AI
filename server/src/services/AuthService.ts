import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '@/repositories/index.js';
import { generateId } from '@/utils/helpers.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    department?: string;
  };
}

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
  private static JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private static JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  /**
   * Hash a password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compare password with hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  static generateToken(payload: TokenPayload, expiresIn: string = this.JWT_EXPIRES_IN): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: TokenPayload): string {
    return this.generateToken(payload, this.JWT_REFRESH_EXPIRES_IN);
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Register a new user
   */
  static async register(email: string, name: string, password: string, role: string = 'candidate'): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const userId = generateId();
    const user = await UserRepository.create(userId, {
      email,
      name,
      password_hash: passwordHash,
      role,
    });

    // Generate tokens
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.generateToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
      },
    };
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    // Find user by email
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const passwordValid = await this.verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.generateToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
      },
    };
  }

  /**
   * Refresh token
   */
  static refreshToken(refreshToken: string): { token: string } {
    const payload = this.verifyToken(refreshToken);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    const newToken = this.generateToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return { token: newToken };
  }

  /**
   * Validate token and get user
   */
  static async validateToken(token: string) {
    const payload = this.verifyToken(token);
    if (!payload) {
      throw new Error('Invalid token');
    }

    const user = await UserRepository.findById(payload.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
