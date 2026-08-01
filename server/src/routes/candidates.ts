import { Router } from 'express';

const router = Router();

// Sample data returned by the API
router.get('/', (_req, res) => {
  res.json({
    candidates: [],
    total: 0,
    message: 'Candidate data served from frontend sample data in demo mode',
  });
});

router.get('/:id', (req, res) => {
  res.json({ id: req.params.id, message: 'Candidate details served from frontend in demo mode' });
});

router.post('/', (req, res) => {
  res.status(201).json({ id: `cand_${Date.now().toString(36)}`, ...req.body });
});

export { router as candidatesRouter };
