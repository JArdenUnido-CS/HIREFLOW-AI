import { Router } from 'express';
import { z } from 'zod';
import { CandidateRepository, JobRepository } from '@/repositories/index.js';
import { ActivityRepository } from '@/repositories/index.js';
import { authenticate, optionalAuth } from '@/middleware/auth.js';
import { generateId } from '@/utils/helpers.js';

const router = Router();

const candidateCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string(),
  location: z.string(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
  photoUrl: z.string().optional(),
  resumeUrl: z.string().optional(),
  resumeText: z.string().optional(),
  parsedData: z.record(z.any()).optional(),
  aiScores: z.record(z.any()).optional(),
  matchScores: z.record(z.any()).optional(),
  status: z.enum(['applied', 'screening', 'shortlisted', 'interview', 'technical_test', 'hr_interview', 'offer', 'hired', 'rejected']).optional(),
  jobId: z.string().optional(),
});

/**
 * GET /api/candidates
 * Get all candidates with pagination and filtering
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string | undefined;

    const candidates = await CandidateRepository.findAll(limit, offset, status);
    res.json({ candidates, limit, offset });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

/**
 * GET /api/candidates/:id
 * Get a specific candidate by ID
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const candidate = await CandidateRepository.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json({ candidate });
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

/**
 * POST /api/candidates
 * Create a new candidate application
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const data = candidateCreateSchema.parse(req.body);

    // Check if email already exists
    const existing = await CandidateRepository.findByEmail(data.email);
    if (existing) {
      return res.status(409).json({ error: 'Candidate with this email already exists' });
    }

    const candidateId = generateId();
    const candidate = await CandidateRepository.create(candidateId, {
      id: candidateId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      location: data.location,
      linkedin: data.linkedin,
      github: data.github,
      portfolio: data.portfolio,
      photo_url: data.photoUrl,
      resume_url: data.resumeUrl,
      resume_text: data.resumeText,
      parsed_data: data.parsedData || {},
      ai_scores: data.aiScores || {},
      match_scores: data.matchScores,
      status: data.status || 'applied',
      job_id: data.jobId,
      applied_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Update job applicant count if jobId provided
    if (data.jobId) {
      const candidates = await CandidateRepository.findByJobId(data.jobId);
      await JobRepository.updateApplicantCount(data.jobId, candidates.length);

      // Log activity
      if (req.userId) {
        await ActivityRepository.create(generateId(), {
          type: 'candidate_added',
          description: `${data.name} applied for the job`,
          user_id: req.userId,
          created_at: new Date().toISOString(),
        });
      }
    }

    res.status(201).json({ candidate });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors
      });
    }
    console.error('Create candidate error:', error);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

/**
 * PATCH /api/candidates/:id
 * Update a candidate
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const existing = await CandidateRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const data = candidateCreateSchema.partial().parse(req.body);

    const candidate = await CandidateRepository.update(req.params.id, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      location: data.location,
      linkedin: data.linkedin,
      github: data.github,
      portfolio: data.portfolio,
      photo_url: data.photoUrl,
      resume_url: data.resumeUrl,
      resume_text: data.resumeText,
      parsed_data: data.parsedData,
      ai_scores: data.aiScores,
      match_scores: data.matchScores,
      status: data.status,
      job_id: data.jobId,
    });

    // Log activity if status changed
    if (data.status && data.status !== existing.status) {
      await ActivityRepository.create(generateId(), {
        type: 'stage_changed',
        description: `${existing.name} moved to ${data.status} stage`,
        user_id: req.userId!,
        created_at: new Date().toISOString(),
      });
    }

    res.json({ candidate });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors
      });
    }
    console.error('Update candidate error:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

/**
 * DELETE /api/candidates/:id
 * Delete/archive a candidate
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const success = await CandidateRepository.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

export { router as candidatesRouter };
