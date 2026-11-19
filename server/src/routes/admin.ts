import { Router } from 'express';
import pool from '../config/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * Admin Routes
 * All routes require admin role
 */

/**
 * GET /api/admin/system-stats
 * Get system-level statistics
 */
router.get('/system-stats', authenticate, requireRole('admin'), async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Get user counts by role
    const [users] = await connection.execute(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );

    const userCounts: Record<string, number> = { admin: 0, employer: 0, client: 0 };
    (users as any[]).forEach((row) => {
      userCounts[row.role] = row.count;
    });

    // Get job stats
    const [jobs] = await connection.execute(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as active FROM jobs"
    );
    const jobStats = (jobs as any[])[0];

    // Get candidate count
    const [candidates] = await connection.execute(
      'SELECT COUNT(*) as count FROM candidates'
    );
    const candidateCount = (candidates as any[])[0].count;

    // Get this week's signups
    const [weeklyUsers] = await connection.execute(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
    );
    const weeklyUserCount = (weeklyUsers as any[])[0].count;

    // Get this week's new jobs
    const [weeklyJobs] = await connection.execute(
      'SELECT COUNT(*) as count FROM jobs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
    );
    const weeklyJobCount = (weeklyJobs as any[])[0].count;

    res.json({
      totalUsers: userCounts.admin + userCounts.employer + userCounts.client,
      totalEmployers: userCounts.employer,
      totalClients: userCounts.client,
      totalJobs: jobStats.total,
      totalCandidates: candidateCount,
      activeJobs: jobStats.active,
      usersThisWeek: weeklyUserCount,
      jobsThisWeek: weeklyJobCount,
    });
  } catch (error) {
    console.error('Failed to fetch system stats:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * GET /api/admin/users
 * Get all registered users
 */
router.get('/users', authenticate, requireRole('admin'), async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [rows] = await connection.execute(
      'SELECT id, email, name, role, department, created_at FROM users ORDER BY created_at DESC LIMIT 1000'
    );

    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * GET /api/admin/activity-summary
 * Get platform activity summary (last 7 days)
 */
router.get('/activity-summary', authenticate, requireRole('admin'), async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const activityData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Users created on this date
      const [usersData] = await connection.execute(
        `SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = ?`,
        [dateStr]
      );
      const users = (usersData as any[])[0].count;

      // Jobs created on this date
      const [jobsData] = await connection.execute(
        `SELECT COUNT(*) as count FROM jobs WHERE DATE(created_at) = ?`,
        [dateStr]
      );
      const jobs = (jobsData as any[])[0].count;

      // Candidates added on this date
      const [candidatesData] = await connection.execute(
        `SELECT COUNT(*) as count FROM candidates WHERE DATE(applied_at) = ?`,
        [dateStr]
      );
      const candidates = (candidatesData as any[])[0].count;

      activityData.push({
        date: dateStr,
        users,
        jobs,
        candidates,
      });
    }

    res.json(activityData);
  } catch (error) {
    console.error('Failed to fetch activity summary:', error);
    res.status(500).json({ error: 'Failed to fetch activity summary' });
  } finally {
    if (connection) connection.release();
  }
});

export { router as adminRouter };
