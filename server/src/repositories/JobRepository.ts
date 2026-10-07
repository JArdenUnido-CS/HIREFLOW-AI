import { RowDataPacket } from 'mysql2/promise';
import { query, queryOne, execute } from '@/utils/db.js';
import { safeJsonParse, safeJsonStringify } from '@/utils/helpers.js';

export interface IJob extends RowDataPacket {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  salary_min?: number;
  salary_max?: number;
  description: string;
  responsibilities: string[];
  benefits: string[];
  skills_required: string[];
  skills_preferred: string[];
  experience_years?: number;
  education?: string;
  status: 'open' | 'closed' | 'paused' | 'draft';
  deadline?: string;
  applicant_count: number;
  created_by: string;
  hiring_manager_id?: string;
  created_at: string;
  updated_at: string;
}

export class JobRepository {
  /**
   * Find job by ID
   */
  static async findById(id: string): Promise<IJob | null> {
    const job = await queryOne<any>(
      'SELECT * FROM jobs WHERE id = ?',
      [id]
    );
    
    if (!job) return null;
    return this.formatJobData(job);
  }

  /**
   * Get all jobs with pagination
   */
  static async findAll(limit: number = 100, offset: number = 0, status?: string): Promise<IJob[]> {
    let sql = 'SELECT * FROM jobs';
    const params: any[] = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const jobs = await query<any[]>(sql, params);
    return jobs.map(job => this.formatJobData(job));
  }

  /**
   * Get jobs by hiring manager
   */
  static async findByHiringManager(hiringManagerId: string): Promise<IJob[]> {
    const jobs = await query<any[]>(
      'SELECT * FROM jobs WHERE hiring_manager_id = ? ORDER BY created_at DESC',
      [hiringManagerId]
    );
    return jobs.map(job => this.formatJobData(job));
  }

  /**
   * Get jobs by status
   */
  static async findByStatus(status: string): Promise<IJob[]> {
    const jobs = await query<any[]>(
      'SELECT * FROM jobs WHERE status = ? ORDER BY created_at DESC',
      [status]
    );
    return jobs.map(job => this.formatJobData(job));
  }

  /**
   * Create a new job
   */
  static async create(id: string, data: Omit<IJob, 'id' | 'created_at' | 'updated_at' | 'applicant_count'>): Promise<IJob> {
    await execute(
      `INSERT INTO jobs (
        id, title, department, location, type, salary_min, salary_max,
        description, responsibilities, benefits, skills_required, skills_preferred,
        experience_years, education, status, deadline, created_by, hiring_manager_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.title,
        data.department,
        data.location,
        data.type,
        data.salary_min || null,
        data.salary_max || null,
        data.description,
        safeJsonStringify(data.responsibilities),
        safeJsonStringify(data.benefits),
        safeJsonStringify(data.skills_required),
        safeJsonStringify(data.skills_preferred),
        data.experience_years || null,
        data.education || null,
        data.status,
        data.deadline || null,
        data.created_by,
        data.hiring_manager_id || null,
      ]
    );

    const job = await this.findById(id);
    if (!job) throw new Error('Failed to create job');
    return job;
  }

  /**
   * Update job
   */
  static async update(id: string, data: Partial<Omit<IJob, 'id' | 'created_at' | 'updated_at' | 'created_by'>>): Promise<IJob> {
    const updates: string[] = [];
    const values: any[] = [];

    const fields = [
      'title', 'department', 'location', 'type', 'salary_min', 'salary_max',
      'description', 'experience_years', 'education', 'status', 'deadline', 'hiring_manager_id'
    ];

    for (const field of fields) {
      if ((data as any)[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push((data as any)[field]);
      }
    }

    // Handle JSON fields
    if (data.responsibilities) {
      updates.push('responsibilities = ?');
      values.push(safeJsonStringify(data.responsibilities));
    }
    if (data.benefits) {
      updates.push('benefits = ?');
      values.push(safeJsonStringify(data.benefits));
    }
    if (data.skills_required) {
      updates.push('skills_required = ?');
      values.push(safeJsonStringify(data.skills_required));
    }
    if (data.skills_preferred) {
      updates.push('skills_preferred = ?');
      values.push(safeJsonStringify(data.skills_preferred));
    }

    if (updates.length === 0) {
      const job = await this.findById(id);
      if (!job) throw new Error('Job not found');
      return job;
    }

    values.push(id);
    await execute(
      `UPDATE jobs SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const job = await this.findById(id);
    if (!job) throw new Error('Failed to update job');
    return job;
  }

  /**
   * Update applicant count
   */
  static async updateApplicantCount(jobId: string, count: number): Promise<void> {
    await execute(
      'UPDATE jobs SET applicant_count = ? WHERE id = ?',
      [count, jobId]
    );
  }

  /**
   * Delete job
   */
  static async delete(id: string): Promise<boolean> {
    const result = await execute(
      'DELETE FROM jobs WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Format job data from database
   */
  private static formatJobData(job: any): IJob {
    return {
      ...job,
      responsibilities: safeJsonParse(job.responsibilities, []),
      benefits: safeJsonParse(job.benefits, []),
      skills_required: safeJsonParse(job.skills_required, []),
      skills_preferred: safeJsonParse(job.skills_preferred, []),
    };
  }
}
