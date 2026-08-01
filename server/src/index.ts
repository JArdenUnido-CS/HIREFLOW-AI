import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from './routes/auth.js';
import { candidatesRouter } from './routes/candidates.js';
import { jobsRouter } from './routes/jobs.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/candidates', candidatesRouter);
app.use('/api/jobs', jobsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`HireFlow API server running on port ${PORT}`);
});

export default app;
