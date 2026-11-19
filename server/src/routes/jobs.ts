import { Router } from 'express';
import { z } from 'zod';
import { JobRepository, CandidateRepository } from '../repositories/index.js';
import { ActivityRepository } from '../repositories/index.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { generateId } from '../utils/helpers.js';
import { JobMatchingService } from '../services/JobMatchingService.js';

const router = Router();

const jobCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  department: z.string().min(2),
  location: z.string().min(2),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote']),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  description: z.string().min(10),
  responsibilities: z.array(z.string()),
  benefits: z.array(z.string()),
  skillsRequired: z.array(z.string()),
  skillsPreferred: z.array(z.string()),
  experienceYears: z.number().optional(),
  education: z.string().optional(),
  status: z.enum(['open', 'closed', 'paused', 'draft']).default('draft'),
  deadline: z.string().optional(),
  hiringManagerId: z.string().optional(),
});

/**
 * GET /api/jobs
 * Get all jobs with pagination and filtering
 * Employers see only their own jobs; admins see all jobs; clients see only open jobs
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string | undefined;

    let jobs;
    // Employers see only their own jobs; admins see all jobs; clients see only open jobs
    if (req.user?.role === 'employer') {
      jobs = await JobRepository.findByEmployer(req.userId!, limit, offset, status);
    } else if (req.user?.role === 'client') {
      // Clients can only see open/published jobs (ignore status param for security)
      jobs = await JobRepository.findByStatus('open', limit, offset);
    } else {
      // Admin can see all jobs
      jobs = await JobRepository.findAll(limit, offset, status);
    }

    res.json({ jobs, limit, offset });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

/**
 * GET /api/jobs/:id
 * Get a specific job by ID
 * Employers can only view jobs they own; clients can only view open jobs; admins can view any job
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const job = await JobRepository.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Employer can only view their own jobs
    if (req.user?.role === 'employer' && job.created_by !== req.userId && job.hiring_manager_id !== req.userId) {
      return res.status(403).json({ error: 'You do not have permission to view this job' });
    }

    // Clients can only view open/published jobs
    if (req.user?.role === 'client' && job.status !== 'open') {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

/**
 * POST /api/jobs
 * Create a new job (employer/admin only)
 * Sets employer_id to the authenticated user
 */
router.post('/', authenticate, requireRole('admin', 'employer'), async (req, res) => {
  try {
    const data = jobCreateSchema.parse(req.body);
    
    const jobId = generateId();
    const job = await JobRepository.create(jobId, {
      id: jobId,
      title: data.title,
      department: data.department,
      location: data.location,
      type: data.type,
      salary_min: data.salaryMin,
      salary_max: data.salaryMax,
      description: data.description,
      responsibilities: data.responsibilities,
      benefits: data.benefits,
      skills_required: data.skillsRequired,
      skills_preferred: data.skillsPreferred,
      experience_years: data.experienceYears,
      education: data.education,
      status: data.status,
      deadline: data.deadline,
      created_by: req.userId!,
      hiring_manager_id: data.hiringManagerId || req.userId!,
      applicant_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Log activity
    await ActivityRepository.create(generateId(), {
      type: 'job_created',
      description: `Created job: ${data.title}`,
      user_id: req.userId!,
      created_at: new Date().toISOString(),
    });

    res.status(201).json({ job });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors
      });
    }
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

/**
 * PATCH /api/jobs/:id
 * Update a job (employer/admin only)
 * Employers can only update jobs they own
 * When job requirements change, automatically re-matches all candidates who applied to this job
 */
router.patch('/:id', authenticate, requireRole('admin', 'employer'), async (req, res) => {
  try {
    const existingJob = await JobRepository.findById(req.params.id);
    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Employer can only update jobs they own
    if (req.user?.role === 'employer' && existingJob.created_by !== req.userId && existingJob.hiring_manager_id !== req.userId) {
      return res.status(403).json({ error: 'You do not have permission to update this job' });
    }

    const data = jobCreateSchema.partial().parse(req.body);

    const job = await JobRepository.update(req.params.id, {
      title: data.title,
      department: data.department,
      location: data.location,
      type: data.type,
      salary_min: data.salaryMin,
      salary_max: data.salaryMax,
      description: data.description,
      responsibilities: data.responsibilities,
      benefits: data.benefits,
      skills_required: data.skillsRequired,
      skills_preferred: data.skillsPreferred,
      experience_years: data.experienceYears,
      education: data.education,
      status: data.status,
      deadline: data.deadline,
      hiring_manager_id: data.hiringManagerId,
    });

    // Check if job requirements changed (skills, experience, education, location)
    const requirementsChanged = 
      (data.skillsRequired && JSON.stringify(data.skillsRequired) !== JSON.stringify(existingJob.skills_required)) ||
      (data.skillsPreferred && JSON.stringify(data.skillsPreferred) !== JSON.stringify(existingJob.skills_preferred)) ||
      (data.experienceYears !== undefined && data.experienceYears !== existingJob.experience_years) ||
      (data.education !== undefined && data.education !== existingJob.education) ||
      (data.location !== undefined && data.location !== existingJob.location);

    let rematchedCount = 0;

    // If requirements changed, re-match all candidates who applied to this job
    if (requirementsChanged) {
      try {
        // Find all candidates who applied to this job
        const applicants = await CandidateRepository.findByJobId(req.params.id);

        // Re-calculate match scores for each candidate
        const jobRequirements = {
          skillsRequired: Array.isArray(job.skills_required) ? job.skills_required : [],
          skillsPreferred: Array.isArray(job.skills_preferred) ? job.skills_preferred : [],
          experienceYears: job.experience_years || 0,
          education: job.education || null,
          location: job.location || '',
          type: job.type || 'full-time',
        };

        for (const candidate of applicants) {
          try {
            if (!candidate.parsed_data || Object.keys(candidate.parsed_data).length === 0) {
              continue; // Skip candidates with no parsed data
            }

            const matchScores = JobMatchingService.calculateMatchScores(
              candidate.parsed_data as any,
              jobRequirements
            );

            // Update candidate match scores
            await CandidateRepository.update(candidate.id, {
              match_scores: {
                ...candidate.match_scores,
                [req.params.id]: matchScores,
              },
            });

            rematchedCount++;
          } catch (matchError) {
            console.error(`Failed to re-match candidate ${candidate.id}:`, matchError);
            // Continue with other candidates if one fails
          }
        }

        console.log(`Re-matched ${rematchedCount} candidates for job ${req.params.id}`);
      } catch (rematchError) {
        console.error(`Failed to re-match candidates for job ${req.params.id}:`, rematchError);
        // Don't fail the entire request if re-matching fails
      }
    }

    res.json({ 
      job,
      rematchedCandidates: rematchedCount,
      requirementsChanged,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors
      });
    }
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

/**
 * DELETE /api/jobs/:id
 * Delete a job (admin only)
 */
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const success = await JobRepository.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

export { router as jobsRouter };
