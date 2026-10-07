import { RowDataPacket } from 'mysql2/promise';
import { query, queryOne, execute } from '@/utils/db.js';

export interface INotification extends RowDataPacket {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  updated_at: string;
}

export class NotificationRepository {
  /**
   * Find notification by ID
   */
  static async findById(id: string): Promise<INotification | null> {
    return queryOne<INotification>(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    );
  }

  /**
   * Get all notifications for a user
   */
  static async findByUserId(userId: string, limit: number = 100, offset: number = 0): Promise<INotification[]> {
    return query<INotification[]>(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );
  }

  /**
   * Get unread notifications for a user
   */
  static async findUnreadByUserId(userId: string): Promise<INotification[]> {
    return query<INotification[]>(
      'SELECT * FROM notifications WHERE user_id = ? AND read = FALSE ORDER BY created_at DESC',
      [userId]
    );
  }

  /**
   * Get count of unread notifications for a user
   */
  static async countUnreadByUserId(userId: string): Promise<number> {
    const result = await queryOne<any>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = FALSE',
      [userId]
    );
    return result?.count || 0;
  }

  /**
   * Create a new notification
   */
  static async create(id: string, data: Omit<INotification, 'id' | 'created_at' | 'updated_at' | 'read'>): Promise<INotification> {
    await execute(
      'INSERT INTO notifications (id, user_id, title, message, type, read) VALUES (?, ?, ?, ?, ?, FALSE)',
      [id, data.user_id, data.title, data.message, data.type]
    );

    const notification = await this.findById(id);
    if (!notification) throw new Error('Failed to create notification');
    return notification;
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id: string): Promise<INotification> {
    await execute(
      'UPDATE notifications SET read = TRUE WHERE id = ?',
      [id]
    );

    const notification = await this.findById(id);
    if (!notification) throw new Error('Failed to update notification');
    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    const result = await execute(
      'UPDATE notifications SET read = TRUE WHERE user_id = ? AND read = FALSE',
      [userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Delete notification
   */
  static async delete(id: string): Promise<boolean> {
    const result = await execute(
      'DELETE FROM notifications WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Delete all notifications for a user
   */
  static async deleteAllByUserId(userId: string): Promise<boolean> {
    const result = await execute(
      'DELETE FROM notifications WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }
}
