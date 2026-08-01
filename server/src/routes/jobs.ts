import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    jobs: [],
    total: 0,
    message: 'Job data served from frontend sample data in demo mode',
  });
});

router.get('/:id', (req, res) => {
  res.json({ id: req.params.id, message: 'Job details served from frontend in demo mode' });
});

router.post('/', (req, res) => {
  res.status(201).json({ id: `job_${Date.now().toString(36)}`, ...req.body });
});

export { router as jobsRouter };
