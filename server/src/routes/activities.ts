import { Router } from 'express';
import { ActivityRepository } from '@/repositories/index.js';
import { authenticate } from '@/middleware/auth.js';

const router = Router();

/**
 * GET /api/activities
 * Get all activities with pagination
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const activities = await ActivityRepository.findAll(limit, offset);
    res.json({ activities, limit, offset });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

/**
 * GET /api/activities/recent
 * Get recent activities
 */
router.get('/recent', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const activities = await ActivityRepository.findRecent(limit);
    res.json({ activities });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

/**
 * GET /api/activities/:id
 * Get a specific activity
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const activity = await ActivityRepository.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.json({ activity });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

export { router as activitiesRouter };
