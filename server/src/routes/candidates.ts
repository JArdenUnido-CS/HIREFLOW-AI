import { Router } from 'express';
import { z } from 'zod';
import { CandidateRepository, JobRepository } from '../repositories/index.js';
import { ActivityRepository } from '../repositories/index.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { generateId } from '../utils/helpers.js';
import { CandidateAnalysisService } from '../services/CandidateAnalysisService.js';
import { JobMatchingService } from '../services/JobMatchingService.js';

const router = Router();

/**
 * Transform candidate data from snake_case (database) to camelCase (API response)
 */
function transformCandidate(candidate: any) {
  return {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    location: candidate.location,
    linkedin: candidate.linkedin,
    github: candidate.github,
    portfolio: candidate.portfolio,
    photoUrl: candidate.photo_url,
    resumeUrl: candidate.resume_url,
    resumeText: candidate.resume_text,
    parsedData: candidate.parsed_data,
    aiScores: candidate.ai_scores,
    matchScores: candidate.match_scores,
    status: candidate.status,
    jobId: candidate.job_id,
    appliedDate: candidate.applied_at,
    appliedAt: candidate.applied_at,
    createdAt: candidate.created_at,
    updatedAt: candidate.updated_at,
  };
}

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
 * Employers see only their own candidates; admins see all candidates; clients see only their own profile
 * Query params: limit, offset, status, email (for client self-lookup)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string | undefined;
    const emailFilter = req.query.email as string | undefined;

    let candidates;

    if (req.user?.role === 'employer') {
      // Employers see all candidates for now (demo/testing)
      candidates = await CandidateRepository.findAll(limit, offset, status);
    } else if (req.user?.role === 'client') {
      // Clients see only their own profile
      if (emailFilter && emailFilter === req.user.email) {
        // Client is requesting their own profile
        const candidate = await CandidateRepository.findByEmail(req.user.email);
        candidates = candidate ? [candidate] : [];
      } else if (emailFilter && emailFilter !== req.user.email) {
        // Attempting to view another client's profile
        return res.status(403).json({ error: 'You do not have permission to view this profile' });
      } else {
        // No email filter provided - clients must provide their own email
        candidates = [];
      }
    } else if (req.user?.role === 'admin') {
      // Admin can see all candidates
      candidates = await CandidateRepository.findAll(limit, offset, status);
    } else {
      return res.status(403).json({ error: 'You do not have permission to view candidates' });
    }

    res.json({ candidates: candidates.map(transformCandidate), limit, offset });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

/**
 * GET /api/candidates/:id
 * Get a specific candidate by ID
 * Employers can only view candidates they own; clients can only view their own profile
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const candidate = await CandidateRepository.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Authorization: employer sees own candidates, client sees own profile, admin sees all
    if (req.user?.role === 'employer') {
      // Employer can only view candidates they own (by job ownership)
      if (candidate.job_id) {
        const job = await JobRepository.findById(candidate.job_id);
        if (!job || (job.created_by !== req.userId && job.hiring_manager_id !== req.userId)) {
          return res.status(403).json({ error: 'You do not have permission to view this candidate' });
        }
      } else {
        // Candidate not linked to a job, employer can't view it
        return res.status(403).json({ error: 'You do not have permission to view this candidate' });
      }
    } else if (req.user?.role === 'client') {
      // Client can only view their own candidate profile (matched by email)
      if (candidate.email !== req.user.email) {
        return res.status(403).json({ error: 'You do not have permission to view this candidate profile' });
      }
    }
    // Admin can view any candidate

    res.json({ candidate: transformCandidate(candidate) });
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

/**
 * POST /api/candidates
 * Create a new candidate application
 * Sets employer_id if authenticated as employer; allows public applications
 * For job applications: prevents duplicate applications (same email + job)
 * For profile creation: allows multiple applications from same person to different jobs
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const data = candidateCreateSchema.parse(req.body);

    // If applying to a job: check for duplicate application (email + job combo)
    if (data.jobId) {
      const jobApplications = await CandidateRepository.findByJobId(data.jobId);
      const duplicateApp = jobApplications.find(c => c.email === data.email);
      if (duplicateApp) {
        return res.status(409).json({ error: 'You have already applied to this job' });
      }
    } else {
      // If creating a candidate profile (not for a specific job): check if email exists
      const existing = await CandidateRepository.findByEmail(data.email);
      if (existing) {
        return res.status(409).json({ error: 'Candidate with this email already exists' });
      }
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

    res.status(201).json({ candidate: transformCandidate(candidate) });
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
 * Employers can only update their own candidates; clients can only update their own profile
 * If parsedData is provided, automatically calculates AI scores
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const existing = await CandidateRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Authorization: employer updates own candidates, client updates own profile, admin can update any
    // Authorization: employer updates own candidates, client updates own profile, admin can update any
    if (req.user?.role === 'employer') {
      if (existing.job_id) {
        const job = await JobRepository.findById(existing.job_id);
        if (!job || (job.created_by !== req.userId && job.hiring_manager_id !== req.userId)) {
          return res.status(403).json({ error: 'You do not have permission to update this candidate' });
        }
      } else {
        return res.status(403).json({ error: 'You do not have permission to update this candidate' });
      }
    } else if (req.user?.role === 'client' && existing.email !== req.user.email) {
      return res.status(403).json({ error: 'You do not have permission to update this candidate profile' });
    }

    const data = candidateCreateSchema.partial().parse(req.body);

    // If parsedData is provided, automatically calculate AI scores
    let aiScores = data.aiScores;
    if (data.parsedData && Object.keys(data.parsedData).length > 0) {
      aiScores = CandidateAnalysisService.calculateAIScores(data.parsedData as any);
    }

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
      ai_scores: aiScores,
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

    res.json({ candidate: transformCandidate(candidate) });
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
 * Employers can only delete their own candidates; admin can delete any
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existing = await CandidateRepository.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Authorization: employer deletes own candidates, admin can delete any
    if (req.user?.role === 'employer') {
      if (existing.job_id) {
        const job = await JobRepository.findById(existing.job_id);
        if (!job || (job.created_by !== req.userId && job.hiring_manager_id !== req.userId)) {
          return res.status(403).json({ error: 'You do not have permission to delete this candidate' });
        }
      } else {
        return res.status(403).json({ error: 'You do not have permission to delete this candidate' });
      }
    }

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

/**
 * POST /api/candidates/:id/analyze
 * Trigger Phase 1 scoring (candidate profile analysis)
 * Calculates AI scores based on parsed resume data
 * Employers can only analyze their own candidates
 */
router.post('/:id/analyze', authenticate, async (req, res) => {
  try {
    const candidate = await CandidateRepository.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Authorization: employer analyzes own candidates, admin can analyze any
    if (req.user?.role === 'employer') {
      if (candidate.job_id) {
        const job = await JobRepository.findById(candidate.job_id);
        if (!job || (job.created_by !== req.userId && job.hiring_manager_id !== req.userId)) {
          return res.status(403).json({ error: 'You do not have permission to analyze this candidate' });
        }
      } else {
        return res.status(403).json({ error: 'You do not have permission to analyze this candidate' });
      }
    }

    // Ensure parsed_data exists
    if (!candidate.parsed_data || Object.keys(candidate.parsed_data).length === 0) {
      return res.status(400).json({ 
        error: 'Candidate has no parsed resume data. Please update parsed_data first.' 
      });
    }

    // Calculate AI scores
    const aiScores = CandidateAnalysisService.calculateAIScores(candidate.parsed_data as any);

    // Update candidate with new scores
    const updated = await CandidateRepository.update(req.params.id, {
      ai_scores: aiScores,
    });

    res.json({ 
      candidate: updated,
      scores: aiScores,
      message: 'Candidate analysis completed successfully'
    });
  } catch (error) {
    console.error('Analyze candidate error:', error);
    res.status(500).json({ error: 'Failed to analyze candidate' });
  }
});

/**
 * POST /api/candidates/:id/match-job/:jobId
 * Trigger Phase 2 scoring (job matching)
 * Calculates match scores between candidate and specific job
 * Employers can only match their own candidates to their own jobs
 */
router.post('/:id/match-job/:jobId', authenticate, async (req, res) => {
  try {
    const candidate = await CandidateRepository.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const job = await JobRepository.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Authorization: employer matches own candidates to own jobs, admin can match any
    if (req.user?.role === 'employer') {
      if ((candidate.job_id && candidate.job_id !== req.params.jobId)) {
        // Candidate applied to a different job, check employer owns both
        const candJob = await JobRepository.findById(candidate.job_id);
        if (!candJob || (candJob.created_by !== req.userId && candJob.hiring_manager_id !== req.userId)) {
          return res.status(403).json({ error: 'You do not have permission to match this candidate to this job' });
        }
      }
      // Check employer owns the job being matched
      if (job.created_by !== req.userId && job.hiring_manager_id !== req.userId) {
        return res.status(403).json({ error: 'You do not have permission to match this candidate to this job' });
      }
    }

    // Ensure parsed_data exists
    if (!candidate.parsed_data || Object.keys(candidate.parsed_data).length === 0) {
      return res.status(400).json({ 
        error: 'Candidate has no parsed resume data. Please update parsed_data first.' 
      });
    }

    // Build job requirements from job data
    const jobRequirements = {
      skillsRequired: job.skills_required || [],
      skillsPreferred: job.skills_preferred || [],
      experienceYears: job.experience_years || 0,
      education: job.education || null,
      location: job.location || '',
      type: job.type || 'mid',
    };

    // Calculate match scores
    const matchScores = JobMatchingService.calculateMatchScores(
      candidate.parsed_data as any,
      jobRequirements
    );

    // Update candidate match scores
    const updated = await CandidateRepository.update(req.params.id, {
      match_scores: {
        ...candidate.match_scores,
        [req.params.jobId]: matchScores,
      },
    });

    res.json({ 
      candidate: updated,
      scores: matchScores,
      job: {
        id: job.id,
        title: job.title,
      },
      message: 'Job matching completed successfully'
    });
  } catch (error) {
    console.error('Match candidate to job error:', error);
    res.status(500).json({ error: 'Failed to match candidate to job' });
  }
});

/**
 * GET /api/candidates/:id/match-scores
 * Retrieve all match scores for a candidate organized by job
 * Employers can only view match scores for their own candidates
 * Returns match scores by jobId
 */
router.get('/:id/match-scores', authenticate, async (req, res) => {
  try {
    const candidate = await CandidateRepository.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Authorization: employer views own candidates' match scores, admin views any
    if (req.user?.role === 'employer') {
      if (candidate.job_id) {
        const job = await JobRepository.findById(candidate.job_id);
        if (!job || (job.created_by !== req.userId && job.hiring_manager_id !== req.userId)) {
          return res.status(403).json({ error: 'You do not have permission to view this candidate\'s match scores' });
        }
      } else {
        return res.status(403).json({ error: 'You do not have permission to view this candidate\'s match scores' });
      }
    }

    const matchScores = candidate.match_scores || {};

    // Optionally fetch job details for context
    const matchScoresWithJobDetails: Record<string, any> = {};
    
    for (const jobId in matchScores) {
      try {
        const job = await JobRepository.findById(jobId);
        matchScoresWithJobDetails[jobId] = {
          scores: matchScores[jobId],
          jobTitle: job?.title || 'Unknown Job',
          jobId: jobId,
        };
      } catch (e) {
        // If job not found, still include the scores
        matchScoresWithJobDetails[jobId] = {
          scores: matchScores[jobId],
          jobTitle: 'Deleted Job',
          jobId: jobId,
        };
      }
    }

    res.json({
      candidateId: candidate.id,
      name: candidate.name,
      email: candidate.email,
      matchScores: matchScoresWithJobDetails,
      totalJobsMatched: Object.keys(matchScores).length,
    });
  } catch (error) {
    console.error('Get candidate match scores error:', error);
    res.status(500).json({ error: 'Failed to retrieve candidate match scores' });
  }
});

export { router as candidatesRouter };
