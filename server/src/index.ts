import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pool from '@/config/database.js';
import { authRouter } from './routes/auth.js';
import { candidatesRouter } from './routes/candidates.js';
import { jobsRouter } from './routes/jobs.js';
import { interviewsRouter } from './routes/interviews.js';
import { notificationsRouter } from './routes/notifications.js';
import { activitiesRouter } from './routes/activities.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(helmet());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/candidates', candidatesRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/interviews', interviewsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/activities', activitiesRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✓ HireFlow API server running on port ${PORT}`);
  console.log(`✓ Frontend URL: ${FRONTEND_URL}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n✓ Shutting down gracefully...');
  server.close(() => {
    console.log('✓ Server closed');
    pool.end(() => {
      console.log('✓ Database pool closed');
      process.exit(0);
    });
  });
});

export default app;
