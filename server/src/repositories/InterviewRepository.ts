import { RowDataPacket } from 'mysql2/promise';
import { query, queryOne, execute } from '@/utils/db.js';
import { safeJsonParse, safeJsonStringify } from '@/utils/helpers.js';

export interface IInterview extends RowDataPacket {
  id: string;
  candidate_id: string;
  job_id?: string;
  scheduled_at: string;
  type: 'technical' | 'behavioral' | 'hr' | 'coding' | 'final';
  status: 'scheduled' | 'completed' | 'cancelled';
  questions?: any[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export class InterviewRepository {
  /**
   * Find interview by ID
   */
  static async findById(id: string): Promise<IInterview | null> {
    const interview = await queryOne<any>(
      'SELECT * FROM interviews WHERE id = ?',
      [id]
    );
    
    if (!interview) return null;
    return this.formatInterviewData(interview);
  }

  /**
   * Get all interviews with pagination
   */
  static async findAll(limit: number = 100, offset: number = 0): Promise<IInterview[]> {
    const interviews = await query<any[]>(
      'SELECT * FROM interviews ORDER BY scheduled_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return interviews.map(i => this.formatInterviewData(i));
  }

  /**
   * Get interviews for a candidate
   */
  static async findByCandidateId(candidateId: string): Promise<IInterview[]> {
    const interviews = await query<any[]>(
      'SELECT * FROM interviews WHERE candidate_id = ? ORDER BY scheduled_at DESC',
      [candidateId]
    );
    return interviews.map(i => this.formatInterviewData(i));
  }

  /**
   * Get interviews for a job
   */
  static async findByJobId(jobId: string): Promise<IInterview[]> {
    const interviews = await query<any[]>(
      'SELECT * FROM interviews WHERE job_id = ? ORDER BY scheduled_at DESC',
      [jobId]
    );
    return interviews.map(i => this.formatInterviewData(i));
  }

  /**
   * Get scheduled interviews
   */
  static async findScheduled(): Promise<IInterview[]> {
    const interviews = await query<any[]>(
      'SELECT * FROM interviews WHERE status = ? ORDER BY scheduled_at ASC',
      ['scheduled']
    );
    return interviews.map(i => this.formatInterviewData(i));
  }

  /**
   * Get upcoming interviews (next 7 days)
   */
  static async findUpcoming(): Promise<IInterview[]> {
    const interviews = await query<any[]>(
      'SELECT * FROM interviews WHERE status = ? AND scheduled_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY) ORDER BY scheduled_at ASC',
      ['scheduled']
    );
    return interviews.map(i => this.formatInterviewData(i));
  }

  /**
   * Create a new interview
   */
  static async create(id: string, data: Omit<IInterview, 'id' | 'created_at' | 'updated_at'>): Promise<IInterview> {
    await execute(
      `INSERT INTO interviews (
        id, candidate_id, job_id, scheduled_at, type, status, questions, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.candidate_id,
        data.job_id || null,
        data.scheduled_at,
        data.type,
        data.status || 'scheduled',
        data.questions ? safeJsonStringify(data.questions) : null,
        data.notes || null,
      ]
    );

    const interview = await this.findById(id);
    if (!interview) throw new Error('Failed to create interview');
    return interview;
  }

  /**
   * Update interview
   */
  static async update(id: string, data: Partial<Omit<IInterview, 'id' | 'created_at' | 'updated_at'>>): Promise<IInterview> {
    const updates: string[] = [];
    const values: any[] = [];

    const fields = ['candidate_id', 'job_id', 'scheduled_at', 'type', 'status', 'notes'];

    for (const field of fields) {
      if ((data as any)[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push((data as any)[field]);
      }
    }

    // Handle JSON fields
    if (data.questions) {
      updates.push('questions = ?');
      values.push(safeJsonStringify(data.questions));
    }

    if (updates.length === 0) {
      const interview = await this.findById(id);
      if (!interview) throw new Error('Interview not found');
      return interview;
    }

    values.push(id);
    await execute(
      `UPDATE interviews SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const interview = await this.findById(id);
    if (!interview) throw new Error('Failed to update interview');
    return interview;
  }

  /**
   * Delete interview
   */
  static async delete(id: string): Promise<boolean> {
    const result = await execute(
      'DELETE FROM interviews WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Format interview data from database
   */
  private static formatInterviewData(interview: any): IInterview {
    return {
      ...interview,
      questions: interview.questions ? safeJsonParse(interview.questions, []) : undefined,
    };
  }
}
