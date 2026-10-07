import { Router } from 'express';
import { z } from 'zod';
import { NotificationRepository } from '@/repositories/index.js';
import { authenticate } from '@/middleware/auth.js';
import { generateId } from '@/utils/helpers.js';

const router = Router();

const notificationCreateSchema = z.object({
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
});

/**
 * GET /api/notifications
 * Get all notifications for the current user
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const notifications = await NotificationRepository.findByUserId(req.userId!, limit, offset);
    const unreadCount = await NotificationRepository.countUnreadByUserId(req.userId!);

    res.json({ notifications, unreadCount, limit, offset });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * GET /api/notifications/unread
 * Get unread notifications
 */
router.get('/unread', authenticate, async (req, res) => {
  try {
    const unreadNotifications = await NotificationRepository.findUnreadByUserId(req.userId!);
    res.json({ notifications: unreadNotifications });
  } catch (error) {
    console.error('Get unread notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * GET /api/notifications/:id
 * Get a specific notification
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const notification = await NotificationRepository.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Verify user owns this notification
    if (notification.user_id !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ notification });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({ error: 'Failed to fetch notification' });
  }
});

/**
 * POST /api/notifications
 * Create a new notification (admin only)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const data = notificationCreateSchema.parse(req.body);

    const notificationId = generateId();
    const notification = await NotificationRepository.create(notificationId, {
      user_id: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
    });

    res.status(201).json({ notification });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors
      });
    }
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await NotificationRepository.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Verify user owns this notification
    if (notification.user_id !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await NotificationRepository.markAsRead(req.params.id);
    res.json({ notification: updated });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read
 */
router.patch('/mark-all-read', authenticate, async (req, res) => {
  try {
    await NotificationRepository.markAllAsRead(req.userId!);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await NotificationRepository.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Verify user owns this notification
    if (notification.user_id !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const success = await NotificationRepository.delete(req.params.id);
    if (success) {
      res.json({ message: 'Notification deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export { router as notificationsRouter };
