/**
 * Mock In-Memory Database for Demo
 * Replaces MySQL/MongoDB with hardcoded sample data
 */

// Sample Users
const mockUsers = [
  {
    id: 'admin-001',
    email: 'admin@hireflow.ai',
    name: 'Admin User',
    password_hash: '$2a$10$dXJ3SW6G7P50eS3xNpmYAOvlErAQvqfD6G1bpRjbmxHvB9XPBgGNe', // password123
    role: 'admin',
    department: 'HR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'candidate-001',
    email: 'john@example.com',
    name: 'John Doe',
    password_hash: '$2a$10$dXJ3SW6G7P50eS3xNpmYAOvlErAQvqfD6G1bpRjbmxHvB9XPBgGNe',
    role: 'candidate',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Sample Jobs
const mockJobs = [
  {
    id: 'job-001',
    title: 'Senior Software Engineer',
    description: 'Looking for experienced full-stack developer',
    location: 'San Francisco, CA',
    salary_min: 150000,
    salary_max: 200000,
    status: 'open',
    hiring_manager_id: 'admin-001',
    created_at: new Date().toISOString(),
  },
  {
    id: 'job-002',
    title: 'Product Manager',
    description: 'Lead product strategy and development',
    location: 'New York, NY',
    salary_min: 120000,
    salary_max: 180000,
    status: 'open',
    hiring_manager_id: 'admin-001',
    created_at: new Date().toISOString(),
  },
];

// Sample Candidates
const mockCandidates = [
  {
    id: 'cand-001',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '555-0001',
    location: 'Seattle, WA',
    status: 'interview',
    applied_at: new Date().toISOString(),
    resume_text: 'Experienced React developer with 5 years in tech',
    ml_score: 0.87,
  },
  {
    id: 'cand-002',
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '555-0002',
    location: 'Austin, TX',
    status: 'applied',
    applied_at: new Date().toISOString(),
    resume_text: 'Full-stack engineer, Python and JavaScript specialist',
    ml_score: 0.92,
  },
  {
    id: 'cand-003',
    name: 'Carol White',
    email: 'carol@example.com',
    phone: '555-0003',
    location: 'Boston, MA',
    status: 'rejected',
    applied_at: new Date().toISOString(),
    resume_text: 'Junior developer with bootcamp training',
    ml_score: 0.45,
  },
];

// Sample Interviews
const mockInterviews = [
  {
    id: 'int-001',
    candidate_id: 'cand-001',
    job_id: 'job-001',
    status: 'scheduled',
    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    interviewer_id: 'admin-001',
    notes: 'Initial screening round',
  },
];

// Sample Analytics
const mockAnalytics = {
  total_candidates: 127,
  hired: 12,
  interviews_completed: 45,
  pipeline_stage_distribution: {
    applied: 45,
    screened: 30,
    interview: 15,
    offer: 8,
    hired: 12,
    rejected: 17,
  },
  avg_time_to_hire: 23,
  ml_model_accuracy: 0.925,
};

// In-Memory Store
export const mockDB = {
  users: [...mockUsers],
  jobs: [...mockJobs],
  candidates: [...mockCandidates],
  interviews: [...mockInterviews],
  analytics: mockAnalytics,
};

// Helper to get items
export function getMockData(collection: string, filter?: any) {
  const data = mockDB[collection as keyof typeof mockDB];
  if (!data || !Array.isArray(data)) return [];
  if (!filter) return data;
  
  return data.filter(item => {
    for (const key in filter) {
      if (item[key as keyof typeof item] !== filter[key]) return false;
    }
    return true;
  });
}

// Helper to get single item
export function getMockDataOne(collection: string, filter: any) {
  const results = getMockData(collection, filter);
  return results.length > 0 ? results[0] : null;
}
