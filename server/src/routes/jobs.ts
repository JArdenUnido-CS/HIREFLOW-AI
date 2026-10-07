import { Router } from 'express';
import { z } from 'zod';
import { JobRepository } from '@/repositories/index.js';
import { ActivityRepository } from '@/repositories/index.js';
import { authenticate, requireRole } from '@/middleware/auth.js';
import { generateId } from '@/utils/helpers.js';

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
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string | undefined;

    const jobs = await JobRepository.findAll(limit, offset, status);
    res.json({ jobs, limit, offset });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

/**
 * GET /api/jobs/:id
 * Get a specific job by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const job = await JobRepository.findById(req.params.id);
    if (!job) {
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
 * Create a new job (admin/hiring_manager only)
 */
router.post('/', authenticate, requireRole('admin', 'hiring_manager'), async (req, res) => {
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
      hiring_manager_id: data.hiringManagerId,
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
 * Update a job (admin/hiring_manager only)
 */
router.patch('/:id', authenticate, requireRole('admin', 'hiring_manager'), async (req, res) => {
  try {
    const existingJob = await JobRepository.findById(req.params.id);
    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Validate that user is admin or the hiring manager
    if (req.user?.role === 'hiring_manager' && existingJob.hiring_manager_id !== req.userId) {
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

    res.json({ job });
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
