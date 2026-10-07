import { Router } from 'express';
import { z } from 'zod';
import { InterviewRepository, CandidateRepository } from '@/repositories/index.js';
import { ActivityRepository } from '@/repositories/index.js';
import { authenticate } from '@/middleware/auth.js';
import { generateId } from '@/utils/helpers.js';

const router = Router();

const interviewCreateSchema = z.object({
  candidateId: z.string(),
  jobId: z.string().optional(),
  scheduledAt: z.string().datetime(),
  type: z.enum(['technical', 'behavioral', 'hr', 'coding', 'final']),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
  questions: z.array(z.any()).optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/interviews
 * Get all interviews with pagination
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const interviews = await InterviewRepository.findAll(limit, offset);
    res.json({ interviews, limit, offset });
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

/**
 * GET /api/interviews/upcoming
 * Get upcoming interviews
 */
router.get('/upcoming', authenticate, async (req, res) => {
  try {
    const interviews = await InterviewRepository.findUpcoming();
    res.json({ interviews });
  } catch (error) {
    console.error('Get upcoming interviews error:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

/**
 * GET /api/interviews/:id
 * Get a specific interview
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const interview = await InterviewRepository.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    res.json({ interview });
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
});

/**
 * POST /api/interviews
 * Create a new interview
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const data = interviewCreateSchema.parse(req.body);

    // Verify candidate exists
    const candidate = await CandidateRepository.findById(data.candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const interviewId = generateId();
    const interview = await InterviewRepository.create(interviewId, {
      id: interviewId,
      candidate_id: data.candidateId,
      job_id: data.jobId,
      scheduled_at: data.scheduledAt,
      type: data.type,
      status: data.status,
      questions: data.questions,
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Log activity
    await ActivityRepository.create(generateId(), {
      type: 'interview_scheduled',
      description: `Interview scheduled with ${candidate.name}`,
      user_id: req.userId!,
      created_at: new Date().toISOString(),
    });

    res.status(201).json({ interview });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors
      });
    }
    console.error('Create interview error:', error);
    res.status(500).json({ error: 'Failed to create interview' });
  }
});

/**
 * PATCH /api/interviews/:id
 * Update an interview
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const existing = await InterviewRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const data = interviewCreateSchema.partial().parse(req.body);

    const interview = await InterviewRepository.update(req.params.id, {
      candidate_id: data.candidateId,
      job_id: data.jobId,
      scheduled_at: data.scheduledAt,
      type: data.type,
      status: data.status,
      questions: data.questions,
      notes: data.notes,
    });

    res.json({ interview });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors
      });
    }
    console.error('Update interview error:', error);
    res.status(500).json({ error: 'Failed to update interview' });
  }
});

/**
 * DELETE /api/interviews/:id
 * Delete an interview
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const success = await InterviewRepository.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({ error: 'Failed to delete interview' });
  }
});

export { router as interviewsRouter };
