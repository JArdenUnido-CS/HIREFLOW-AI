import { Router } from 'express';
import { z } from 'zod';
import { InterviewRepository, CandidateRepository } from '../repositories/index.js';
import { ActivityRepository } from '../repositories/index.js';
import { authenticate } from '../middleware/auth.js';
import { generateId } from '../utils/helpers.js';

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
 * Get all interviews with pagination and filtering
 * Employers see only interviews for their candidates; clients see only their own interviews; admins see all
 * Query params: limit, offset, candidateId (for filtering by candidate)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const candidateIdFilter = req.query.candidateId as string | undefined;

    let interviews = await InterviewRepository.findAll(limit, offset);
    
    // Apply role-based filtering
    if (req.user?.role === 'employer') {
      // Employers only see interviews for their own candidates
      const candidateIds = interviews.map(i => i.candidate_id);
      if (candidateIds.length > 0) {
        const candidates = await Promise.all(
          candidateIds.map(id => CandidateRepository.findById(id))
        );
        interviews = interviews.filter((interview, idx) => {
          return candidates[idx]?.employer_id === req.userId;
        });
      }
    } else if (req.user?.role === 'client') {
      // Clients see only interviews for their own candidate profile
      // Find the candidate record for this client (matched by email)
      const candidate = await CandidateRepository.findByEmail(req.user.email!);
      if (candidate) {
        interviews = interviews.filter(i => i.candidate_id === candidate.id);
      } else {
        // Client has no candidate record yet
        interviews = [];
      }
    }
    // Admins see all interviews (no filtering)

    // Apply additional candidateId filter if provided and authorized
    if (candidateIdFilter) {
      // Only allow filtering if user is admin, or if they're viewing their own candidate's interviews
      if (req.user?.role !== 'admin') {
        const candidate = await CandidateRepository.findById(candidateIdFilter);
        if (req.user?.role === 'employer' && candidate?.employer_id !== req.userId) {
          return res.status(403).json({ error: 'You do not have permission to view this candidate\'s interviews' });
        } else if (req.user?.role === 'client' && candidate?.email !== req.user.email) {
          return res.status(403).json({ error: 'You do not have permission to view this candidate\'s interviews' });
        }
      }
      interviews = interviews.filter(i => i.candidate_id === candidateIdFilter);
    }

    res.json({ interviews, limit, offset });
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

/**
 * GET /api/interviews/upcoming
 * Get upcoming interviews
 * Employers see only interviews for their candidates; admins see all
 */
router.get('/upcoming', authenticate, async (req, res) => {
  try {
    let interviews = await InterviewRepository.findUpcoming();
    
    // Employers only see interviews for their own candidates
    if (req.user?.role === 'employer') {
      const candidateIds = interviews.map(i => i.candidate_id);
      if (candidateIds.length > 0) {
        const candidates = await Promise.all(
          candidateIds.map(id => CandidateRepository.findById(id))
        );
        interviews = interviews.filter((interview, idx) => {
          return candidates[idx]?.employer_id === req.userId;
        });
      }
    }

    res.json({ interviews });
  } catch (error) {
    console.error('Get upcoming interviews error:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

/**
 * GET /api/interviews/:id
 * Get a specific interview
 * Employers can only view interviews for their own candidates; clients can only view their own interviews
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const interview = await InterviewRepository.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Authorization: check ownership based on role
    if (req.user?.role === 'employer') {
      const candidate = await CandidateRepository.findById(interview.candidate_id);
      if (!candidate || candidate.employer_id !== req.userId) {
        return res.status(403).json({ error: 'You do not have permission to view this interview' });
      }
    } else if (req.user?.role === 'client') {
      const candidate = await CandidateRepository.findById(interview.candidate_id);
      if (!candidate || candidate.email !== req.user.email) {
        return res.status(403).json({ error: 'You do not have permission to view this interview' });
      }
    }
    // Admins can view any interview (no additional check needed)

    res.json({ interview });
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
});

/**
 * POST /api/interviews
 * Create a new interview
 * Employers can only create interviews for their own candidates
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const data = interviewCreateSchema.parse(req.body);

    // Verify candidate exists
    const candidate = await CandidateRepository.findById(data.candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Authorization: employer can only schedule interviews for their own candidates
    if (req.user?.role === 'employer' && candidate.employer_id !== req.userId) {
      return res.status(403).json({ error: 'You do not have permission to schedule interviews for this candidate' });
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
 * Employers can only update interviews for their own candidates
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const existing = await InterviewRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Authorization: check candidate ownership
    if (req.user?.role === 'employer') {
      const candidate = await CandidateRepository.findById(existing.candidate_id);
      if (!candidate || candidate.employer_id !== req.userId) {
        return res.status(403).json({ error: 'You do not have permission to update this interview' });
      }
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
 * Employers can only delete interviews for their own candidates
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await InterviewRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Authorization: check candidate ownership
    if (req.user?.role === 'employer') {
      const candidate = await CandidateRepository.findById(existing.candidate_id);
      if (!candidate || candidate.employer_id !== req.userId) {
        return res.status(403).json({ error: 'You do not have permission to delete this interview' });
      }
    }

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
