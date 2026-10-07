import { RowDataPacket } from 'mysql2/promise';
import { query, queryOne, execute } from '@/utils/db.js';
import { safeJsonParse, safeJsonStringify } from '@/utils/helpers.js';

export interface ICandidate extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  photo_url?: string;
  resume_url?: string;
  resume_text?: string;
  parsed_data: any;
  ai_scores: any;
  match_scores?: any;
  status: string;
  job_id?: string;
  applied_at: string;
  created_at: string;
  updated_at: string;
}

export class CandidateRepository {
  /**
   * Find candidate by ID
   */
  static async findById(id: string): Promise<ICandidate | null> {
    const candidate = await queryOne<any>(
      'SELECT * FROM candidates WHERE id = ?',
      [id]
    );
    
    if (!candidate) return null;
    return this.formatCandidateData(candidate);
  }

  /**
   * Get all candidates with pagination
   */
  static async findAll(limit: number = 100, offset: number = 0, status?: string): Promise<ICandidate[]> {
    let sql = 'SELECT * FROM candidates';
    const params: any[] = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += ' ORDER BY applied_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const candidates = await query<any[]>(sql, params);
    return candidates.map(c => this.formatCandidateData(c));
  }

  /**
   * Get candidates for a specific job
   */
  static async findByJobId(jobId: string): Promise<ICandidate[]> {
    const candidates = await query<any[]>(
      'SELECT * FROM candidates WHERE job_id = ? ORDER BY applied_at DESC',
      [jobId]
    );
    return candidates.map(c => this.formatCandidateData(c));
  }

  /**
   * Get candidates by status
   */
  static async findByStatus(status: string): Promise<ICandidate[]> {
    const candidates = await query<any[]>(
      'SELECT * FROM candidates WHERE status = ? ORDER BY applied_at DESC',
      [status]
    );
    return candidates.map(c => this.formatCandidateData(c));
  }

  /**
   * Find candidate by email
   */
  static async findByEmail(email: string): Promise<ICandidate | null> {
    const candidate = await queryOne<any>(
      'SELECT * FROM candidates WHERE email = ?',
      [email]
    );
    return candidate ? this.formatCandidateData(candidate) : null;
  }

  /**
   * Create a new candidate
   */
  static async create(id: string, data: Omit<ICandidate, 'id' | 'created_at' | 'updated_at'>): Promise<ICandidate> {
    await execute(
      `INSERT INTO candidates (
        id, name, email, phone, location, linkedin, github, portfolio,
        photo_url, resume_url, resume_text, parsed_data, ai_scores,
        match_scores, status, job_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.email,
        data.phone,
        data.location,
        data.linkedin || null,
        data.github || null,
        data.portfolio || null,
        data.photo_url || null,
        data.resume_url || null,
        data.resume_text || null,
        safeJsonStringify(data.parsed_data),
        safeJsonStringify(data.ai_scores),
        data.match_scores ? safeJsonStringify(data.match_scores) : null,
        data.status || 'applied',
        data.job_id || null,
      ]
    );

    const candidate = await this.findById(id);
    if (!candidate) throw new Error('Failed to create candidate');
    return candidate;
  }

  /**
   * Update candidate
   */
  static async update(id: string, data: Partial<Omit<ICandidate, 'id' | 'created_at' | 'updated_at' | 'applied_at'>>): Promise<ICandidate> {
    const updates: string[] = [];
    const values: any[] = [];

    const fields = [
      'name', 'email', 'phone', 'location', 'linkedin', 'github', 'portfolio',
      'photo_url', 'resume_url', 'resume_text', 'status', 'job_id'
    ];

    for (const field of fields) {
      if ((data as any)[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push((data as any)[field]);
      }
    }

    // Handle JSON fields
    if (data.parsed_data) {
      updates.push('parsed_data = ?');
      values.push(safeJsonStringify(data.parsed_data));
    }
    if (data.ai_scores) {
      updates.push('ai_scores = ?');
      values.push(safeJsonStringify(data.ai_scores));
    }
    if (data.match_scores) {
      updates.push('match_scores = ?');
      values.push(safeJsonStringify(data.match_scores));
    }

    if (updates.length === 0) {
      const candidate = await this.findById(id);
      if (!candidate) throw new Error('Candidate not found');
      return candidate;
    }

    values.push(id);
    await execute(
      `UPDATE candidates SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const candidate = await this.findById(id);
    if (!candidate) throw new Error('Failed to update candidate');
    return candidate;
  }

  /**
   * Delete candidate
   */
  static async delete(id: string): Promise<boolean> {
    const result = await execute(
      'DELETE FROM candidates WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Format candidate data from database
   */
  private static formatCandidateData(candidate: any): ICandidate {
    return {
      ...candidate,
      parsed_data: safeJsonParse(candidate.parsed_data, {}),
      ai_scores: safeJsonParse(candidate.ai_scores, {}),
      match_scores: candidate.match_scores ? safeJsonParse(candidate.match_scores, {}) : undefined,
    };
  }
}
