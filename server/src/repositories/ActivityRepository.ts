import { RowDataPacket } from 'mysql2/promise';
import { query, queryOne, execute } from '@/utils/db.js';
import { safeJsonParse, safeJsonStringify } from '@/utils/helpers.js';

export interface IActivity extends RowDataPacket {
  id: string;
  type: 'candidate_added' | 'stage_changed' | 'interview_scheduled' | 'offer_sent' | 'note_added' | 'job_created';
  description: string;
  user_id: string;
  metadata?: any;
  created_at: string;
}

export class ActivityRepository {
  /**
   * Find activity by ID
   */
  static async findById(id: string): Promise<IActivity | null> {
    const activity = await queryOne<any>(
      'SELECT * FROM activities WHERE id = ?',
      [id]
    );
    
    if (!activity) return null;
    return this.formatActivityData(activity);
  }

  /**
   * Get all activities with pagination
   */
  static async findAll(limit: number = 100, offset: number = 0): Promise<IActivity[]> {
    const activities = await query<any[]>(
      'SELECT * FROM activities ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return activities.map(a => this.formatActivityData(a));
  }

  /**
   * Get recent activities
   */
  static async findRecent(limit: number = 50): Promise<IActivity[]> {
    const activities = await query<any[]>(
      'SELECT * FROM activities ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return activities.map(a => this.formatActivityData(a));
  }

  /**
   * Get activities by user
   */
  static async findByUserId(userId: string): Promise<IActivity[]> {
    const activities = await query<any[]>(
      'SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return activities.map(a => this.formatActivityData(a));
  }

  /**
   * Get activities by type
   */
  static async findByType(type: string): Promise<IActivity[]> {
    const activities = await query<any[]>(
      'SELECT * FROM activities WHERE type = ? ORDER BY created_at DESC',
      [type]
    );
    return activities.map(a => this.formatActivityData(a));
  }

  /**
   * Create a new activity
   */
  static async create(id: string, data: Omit<IActivity, 'id' | 'created_at'>): Promise<IActivity> {
    await execute(
      'INSERT INTO activities (id, type, description, user_id, metadata) VALUES (?, ?, ?, ?, ?)',
      [
        id,
        data.type,
        data.description,
        data.user_id,
        data.metadata ? safeJsonStringify(data.metadata) : null,
      ]
    );

    const activity = await this.findById(id);
    if (!activity) throw new Error('Failed to create activity');
    return activity;
  }

  /**
   * Delete activity
   */
  static async delete(id: string): Promise<boolean> {
    const result = await execute(
      'DELETE FROM activities WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Format activity data from database
   */
  private static formatActivityData(activity: any): IActivity {
    return {
      ...activity,
      metadata: activity.metadata ? safeJsonParse(activity.metadata, {}) : undefined,
    };
  }
}
