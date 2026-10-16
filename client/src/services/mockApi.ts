/**
 * Mock API Data for Demo Mode
 * Provides sample data when backend is unavailable
 */

export const mockApi = {
  // Auth
  login: async (email: string, password: string) => ({
    token: 'demo-token-' + Date.now(),
    refreshToken: 'demo-refresh-' + Date.now(),
    user: {
      id: 'user-' + email,
      email,
      name: email === 'admin@hireflow.ai' ? 'Admin User' : 'Demo User',
      role: email === 'admin@hireflow.ai' ? 'admin' : 'candidate',
    },
  }),

  register: async (name: string, email: string, password: string) => ({
    token: 'demo-token-' + Date.now(),
    refreshToken: 'demo-refresh-' + Date.now(),
    user: { id: 'user-new', email, name, role: 'candidate' },
  }),

  // Candidates
  getCandidates: async () => ({
    data: [
      {
        id: 'cand-1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        status: 'interview',
        ml_score: 0.87,
        phone: '555-0001',
        location: 'Seattle, WA',
      },
      {
        id: 'cand-2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        status: 'applied',
        ml_score: 0.92,
        phone: '555-0002',
        location: 'Austin, TX',
      },
      {
        id: 'cand-3',
        name: 'Carol White',
        email: 'carol@example.com',
        status: 'rejected',
        ml_score: 0.45,
        phone: '555-0003',
        location: 'Boston, MA',
      },
    ],
    total: 127,
  }),

  // Jobs
  getJobs: async () => ({
    data: [
      {
        id: 'job-1',
        title: 'Senior Software Engineer',
        description: 'Looking for experienced full-stack developer',
        location: 'San Francisco, CA',
        salary_min: 150000,
        salary_max: 200000,
        status: 'open',
      },
      {
        id: 'job-2',
        title: 'Product Manager',
        description: 'Lead product strategy and development',
        location: 'New York, NY',
        salary_min: 120000,
        salary_max: 180000,
        status: 'open',
      },
    ],
    total: 8,
  }),

  // Pipeline
  getPipeline: async () => ({
    data: {
      applied: 45,
      screened: 30,
      interview: 15,
      offer: 8,
      hired: 12,
      rejected: 17,
    },
  }),

  // Analytics
  getAnalytics: async () => ({
    data: {
      total_candidates: 127,
      hired: 12,
      interviews_completed: 45,
      avg_time_to_hire: 23,
      ml_model_accuracy: 0.925,
      pipeline_stage_distribution: {
        applied: 45,
        screened: 30,
        interview: 15,
        offer: 8,
        hired: 12,
        rejected: 17,
      },
    },
  }),

  // Interviews
  getInterviews: async () => ({
    data: [
      {
        id: 'int-1',
        candidate_id: 'cand-1',
        candidate_name: 'Alice Johnson',
        job_id: 'job-1',
        status: 'scheduled',
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
        notes: 'Initial screening round',
      },
    ],
    total: 5,
  }),

  // Generic fallback for any endpoint
  fallback: async () => ({ data: [], message: 'Using demo data' }),
};
