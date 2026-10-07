import { RowDataPacket } from 'mysql2/promise';
import { query, queryOne, execute } from '@/utils/db.js';

export interface IUser extends RowDataPacket {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  avatar?: string;
  role: 'admin' | 'recruiter' | 'hiring_manager' | 'viewer' | 'candidate';
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface IUserPublic extends Omit<IUser, 'password_hash'> {}

export class UserRepository {
  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<IUserPublic | null> {
    const user = await queryOne<IUser>(
      'SELECT id, email, name, avatar, role, department, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return user || null;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<IUser | null> {
    return queryOne<IUser>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
  }

  /**
   * Get all users (with pagination)
   */
  static async findAll(limit: number = 100, offset: number = 0): Promise<IUserPublic[]> {
    return query<IUserPublic[]>(
      'SELECT id, email, name, avatar, role, department, created_at, updated_at FROM users LIMIT ? OFFSET ?',
      [limit, offset]
    );
  }

  /**
   * Get all users by role
   */
  static async findByRole(role: string): Promise<IUserPublic[]> {
    return query<IUserPublic[]>(
      'SELECT id, email, name, avatar, role, department, created_at, updated_at FROM users WHERE role = ?',
      [role]
    );
  }

  /**
   * Create a new user
   */
  static async create(id: string, data: {
    email: string;
    name: string;
    password_hash: string;
    role?: string;
    department?: string;
    avatar?: string;
  }): Promise<IUserPublic> {
    const role = data.role || 'candidate';
    
    await execute(
      'INSERT INTO users (id, email, name, password_hash, role, department, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, data.email, data.name, data.password_hash, role, data.department || null, data.avatar || null]
    );

    const user = await this.findById(id);
    if (!user) throw new Error('Failed to create user');
    return user;
  }

  /**
   * Update user
   */
  static async update(id: string, data: Partial<{
    name: string;
    avatar: string;
    department: string;
  }>): Promise<IUserPublic> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(data.avatar);
    }
    if (data.department !== undefined) {
      updates.push('department = ?');
      values.push(data.department);
    }

    if (updates.length === 0) {
      const user = await this.findById(id);
      if (!user) throw new Error('User not found');
      return user;
    }

    values.push(id);
    await execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const user = await this.findById(id);
    if (!user) throw new Error('Failed to update user');
    return user;
  }

  /**
   * Delete user (soft delete via archive)
   */
  static async delete(id: string): Promise<boolean> {
    const result = await execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}
