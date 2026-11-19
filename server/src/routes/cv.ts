import { Router } from 'express';
import { z } from 'zod';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { generateId } from '../utils/helpers.js';
import { CandidateAnalysisService } from '../services/CandidateAnalysisService.js';
import { JobMatchingService } from '../services/JobMatchingService.js';
import { CandidateRepository } from '../repositories/index.js';
import { JobRepository } from '../repositories/index.js';

const router = Router();

// Validation schemas
const experienceSchema = z.object({
  title: z.string().min(1, 'Position title required'),
  company: z.string().min(1, 'Company required'),
  location: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM'),
  endDate: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM').optional().nullable(),
  isCurrent: z.boolean().optional(),
  description: z.array(z.string()).optional().default([]),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote']).optional(),
}).strict().refine(
  (data) => {
    if (data.endDate && data.startDate > data.endDate) {
      return false;
    }
    return true;
  },
  { message: 'End date cannot be before start date', path: ['endDate'] }
);

const educationSchema = z.object({
  degree: z.string().min(1, 'Degree/Program required'),
  field: z.string().min(1, 'Field of study required'),
  institution: z.string().min(1, 'School/Institution required'),
  year: z.number().int().min(1900).max(2100, 'Valid year required'),
  startYear: z.number().int().min(1900).max(2100).optional(),
  gpa: z.number().min(0).max(4).optional(),
  description: z.string().optional(),
}).strict().refine(
  (data) => {
    if (data.startYear && data.startYear > data.year) {
      return false;
    }
    return true;
  },
  { message: 'Start year cannot be after graduation year', path: ['year'] }
);

const skillSchema = z.object({
  category: z.string().min(1, 'Category required'),
  skills: z.array(z.string().min(1)).min(1, 'At least one skill required'),
}).strict();

const languageSchema = z.object({
  language: z.string().min(1, 'Language required'),
  proficiency: z.enum(['Basic', 'Intermediate', 'Advanced', 'Fluent', 'Native']),
}).strict();

const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name required'),
  issuer: z.string().optional(),
  dateIssued: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM').optional(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM').optional(),
}).strict();

const projectSchema = z.object({
  name: z.string().min(1, 'Project name required'),
  description: z.string().min(1, 'Description required'),
  technologies: z.array(z.string().min(1)).min(1, 'At least one technology required'),
  url: z.string().url().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM').optional().nullable(),
}).strict().refine(
  (data) => {
    if (data.endDate && data.startDate && data.startDate > data.endDate) {
      return false;
    }
    return true;
  },
  { message: 'End date cannot be before start date', path: ['endDate'] }
);

const cvDataSchema = z.object({
  summary: z.string().min(0, 'Professional summary').optional().default(''),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  skills: z.array(skillSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  languages: z.array(languageSchema).default([]),
  projects: z.array(projectSchema).default([]),
  achievements: z.array(z.string()).default([]),
}).strict();

/**
 * GET /api/cv/by-email/:email
 * Get or create candidate by email (for CV Builder initialization)
 */
router.get('/by-email/:email', authenticate, async (req, res) => {
  try {
    const { email } = req.params;
    const connection = await pool.getConnection();

    try {
      // Try to find existing candidate
      const [existingRows] = await connection.execute(
        'SELECT id, name, email FROM candidates WHERE email = ?',
        [email]
      );

      if ((existingRows as any[]).length > 0) {
        return res.json((existingRows as any[])[0]);
      }

      // Candidate doesn't exist, create one from authenticated user
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const candidateId = generateId();
      await connection.execute(
        'INSERT INTO candidates (id, name, email, phone, location, status, applied_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [candidateId, req.user.email.split('@')[0], email, '', '', 'applied']
      );

      res.json({ id: candidateId, name: req.user.email.split('@')[0], email });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to get/create candidate:', error);
    res.status(500).json({ error: 'Failed to initialize CV' });
  }
});

/**
 * GET /api/cv/:candidateId
 * Get candidate's CV/profile data
 */
router.get('/:candidateId', authenticate, async (req, res) => {
  try {
    const { candidateId } = req.params;
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(
        'SELECT id, name, email, phone, location, linkedin, github, portfolio, photo_url, resume_url, resume_text, parsed_data, created_at, updated_at FROM candidates WHERE id = ?',
        [candidateId]
      );

      if (!rows || (rows as any[]).length === 0) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      const candidate = (rows as any[])[0];
      
      // Parse JSON fields
      if (candidate.parsed_data && typeof candidate.parsed_data === 'string') {
        candidate.parsed_data = JSON.parse(candidate.parsed_data);
      }

      res.json(candidate);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Failed to fetch CV:', error);
    res.status(500).json({ error: 'Failed to fetch CV data' });
  }
});

/**
 * PATCH /api/cv/:candidateId
 * Update candidate's CV/profile data
 * Automatically recalculates AI scores when CV is updated
 */
router.patch('/:candidateId', authenticate, async (req, res) => {
  let connection;
  try {
    const { candidateId } = req.params;

    // Validate CV data
    const cvData = cvDataSchema.parse(req.body);

    // Calculate total years of experience
    const totalYearsExperience = calculateYearsExperience(cvData.experience);

    connection = await pool.getConnection();

    // Check if candidate exists
    const [candidateCheck] = await connection.execute(
      'SELECT id FROM candidates WHERE id = ?',
      [candidateId]
    );

    if (!candidateCheck || (candidateCheck as any[]).length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Prepare updated data with calculated totalYearsExperience
    const updateData = {
      ...cvData,
      totalYearsExperience,
    };

    // Calculate AI scores from the updated CV data
    const aiScores = CandidateAnalysisService.calculateAIScores(updateData);

    // Update candidate with CV data and recalculated AI scores
    const [result] = await connection.execute(
      'UPDATE candidates SET parsed_data = ?, ai_scores = ?, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(updateData), JSON.stringify(aiScores), candidateId]
    );

    // Fetch updated candidate
    const [updatedRows] = await connection.execute(
      'SELECT id, name, email, phone, location, linkedin, github, portfolio, photo_url, resume_url, resume_text, parsed_data, ai_scores, job_id, created_at, updated_at FROM candidates WHERE id = ?',
      [candidateId]
    );

    const updatedCandidate = (updatedRows as any[])[0];
    if (updatedCandidate.parsed_data && typeof updatedCandidate.parsed_data === 'string') {
      updatedCandidate.parsed_data = JSON.parse(updatedCandidate.parsed_data);
    }
    if (updatedCandidate.ai_scores && typeof updatedCandidate.ai_scores === 'string') {
      updatedCandidate.ai_scores = JSON.parse(updatedCandidate.ai_scores);
    }

    // Auto-trigger job matching: find all jobs this candidate has applied to
    // and re-calculate match scores with the updated CV data
    const jobsToMatch: any[] = [];
    
    if (updatedCandidate.job_id) {
      // Candidate has a job_id - match to that job
      jobsToMatch.push(updatedCandidate.job_id);
    }
    
    // Also fetch any other candidates with the same email (same person applying to multiple jobs)
    const [relatedCandidates] = await connection.execute(
      'SELECT DISTINCT job_id FROM candidates WHERE email = ? AND job_id IS NOT NULL',
      [updatedCandidate.email]
    );
    
    for (const row of relatedCandidates as any[]) {
      if (row.job_id && !jobsToMatch.includes(row.job_id)) {
        jobsToMatch.push(row.job_id);
      }
    }

    // Run matching for each job and collect scores
    const matchScoresMap: Record<string, any> = {};
    
    for (const jobId of jobsToMatch) {
      try {
        const job = await JobRepository.findById(jobId);
        if (!job) continue;

        const jobRequirements = {
          skillsRequired: job.skills_required || [],
          skillsPreferred: job.skills_preferred || [],
          experienceYears: job.experience_years || 0,
          education: job.education || null,
          location: job.location || '',
          type: job.type || 'mid',
        };

        const matchScores = JobMatchingService.calculateMatchScores(
          updateData,
          jobRequirements
        );

        matchScoresMap[jobId] = matchScores;
      } catch (matchError) {
        console.error(`Failed to calculate match scores for job ${jobId}:`, matchError);
        // Continue with other jobs if one fails
      }
    }

    // Update candidate with new match scores
    if (Object.keys(matchScoresMap).length > 0) {
      const currentMatchScores = updatedCandidate.match_scores || {};
      const mergedMatchScores = {
        ...currentMatchScores,
        ...matchScoresMap,
      };

      await connection.execute(
        'UPDATE candidates SET match_scores = ? WHERE id = ?',
        [JSON.stringify(mergedMatchScores), candidateId]
      );

      // Update the response with merged match scores
      updatedCandidate.match_scores = mergedMatchScores;
    }

    res.json({ 
      message: 'CV updated successfully. AI scores recalculated and job matches updated.',
      candidate: updatedCandidate,
      aiScores: updatedCandidate.ai_scores,
      matchedJobs: Object.keys(matchScoresMap).length
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      });
    }
    console.error('Failed to update CV:', error);
    res.status(500).json({ error: 'Failed to update CV data' });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * Helper function to calculate years of experience from work history
 */
function calculateYearsExperience(experiences: any[]): number {
  if (!experiences || experiences.length === 0) return 0;

  let totalMonths = 0;

  experiences.forEach((exp: any) => {
    const startDate = new Date(exp.startDate + '-01');
    const endDate = exp.endDate ? new Date(exp.endDate + '-01') : new Date();

    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                   (endDate.getMonth() - startDate.getMonth());

    totalMonths += Math.max(0, months);
  });

  return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal
}

export { router as cvRouter };
