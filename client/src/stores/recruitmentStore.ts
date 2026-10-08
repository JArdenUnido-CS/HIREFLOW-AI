import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import api from '@/services/api';

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  created_at?: string;
}

export interface Job {
  id: number;
  title: string;
  department?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  description?: string;
  required_skills?: string[];
  status: 'OPEN' | 'CLOSED';
  created_at?: string;
}

export interface Interview {
  id: number;
  candidate_id: number;
  candidateId?: number;
  job_id: number;
  jobId?: number;
  scheduled_at: string;
  scheduledAt?: string;
  type?: string;
  status?: string;
  created_at?: string;
}

interface RecruitmentStore {
  // State
  candidates: Candidate[];
  jobs: Job[];
  interviews: Interview[];
  loading: boolean;
  error: string | null;

  // Actions - Candidates
  setCandidates: (candidates: Candidate[]) => void;
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: number, candidate: Partial<Candidate>) => void;
  deleteCandidate: (id: number) => void;
  fetchCandidates: () => Promise<void>;

  // Actions - Jobs
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateJob: (id: number, job: Partial<Job>) => void;
  deleteJob: (id: number) => void;
  fetchJobs: () => Promise<void>;

  // Actions - Interviews
  setInterviews: (interviews: Interview[]) => void;
  addInterview: (interview: Interview) => void;
  updateInterview: (id: number, interview: Partial<Interview>) => void;
  deleteInterview: (id: number) => void;
  fetchInterviews: () => Promise<void>;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  syncAll: () => Promise<void>;
}

export const useRecruitmentStore = create<RecruitmentStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    candidates: [],
    jobs: [],
    interviews: [],
    loading: false,
    error: null,

    // Candidates
    setCandidates: (candidates) => set({ candidates }),
    addCandidate: (candidate) =>
      set((state) => ({ candidates: [...state.candidates, candidate] })),
    updateCandidate: (id, candidate) =>
      set((state) => ({
        candidates: state.candidates.map((c) =>
          c.id === id ? { ...c, ...candidate } : c
        ),
      })),
    deleteCandidate: (id) =>
      set((state) => ({
        candidates: state.candidates.filter((c) => c.id !== id),
      })),
    fetchCandidates: async () => {
      try {
        set({ loading: true, error: null });
        const response = await api.get('/candidates');
        set({ candidates: response.data, loading: false });
      } catch (error: any) {
        set({ error: error.message, loading: false });
      }
    },

    // Jobs
    setJobs: (jobs) => set({ jobs }),
    addJob: (job) => set((state) => ({ jobs: [...state.jobs, job] })),
    updateJob: (id, job) =>
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...job } : j)),
      })),
    deleteJob: (id) =>
      set((state) => ({
        jobs: state.jobs.filter((j) => j.id !== id),
      })),
    fetchJobs: async () => {
      try {
        set({ loading: true, error: null });
        const response = await api.get('/jobs');
        set({ jobs: response.data, loading: false });
      } catch (error: any) {
        set({ error: error.message, loading: false });
      }
    },

    // Interviews
    setInterviews: (interviews) => set({ interviews }),
    addInterview: (interview) =>
      set((state) => ({ interviews: [...state.interviews, interview] })),
    updateInterview: (id, interview) =>
      set((state) => ({
        interviews: state.interviews.map((i) =>
          i.id === id ? { ...i, ...interview } : i
        ),
      })),
    deleteInterview: (id) =>
      set((state) => ({
        interviews: state.interviews.filter((i) => i.id !== id),
      })),
    fetchInterviews: async () => {
      try {
        set({ loading: true, error: null });
        const response = await api.get('/interviews');
        set({ interviews: response.data, loading: false });
      } catch (error: any) {
        set({ error: error.message, loading: false });
      }
    },

    // Utility
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // Sync all data
    syncAll: async () => {
      const { fetchCandidates, fetchJobs, fetchInterviews } = get();
      await Promise.all([fetchCandidates(), fetchJobs(), fetchInterviews()]);
    },
  }))
);

// Auto-sync every 5 seconds
let syncInterval: NodeJS.Timeout | null = null;

export const startAutoSync = () => {
  if (syncInterval) return;
  syncInterval = setInterval(() => {
    useRecruitmentStore.getState().syncAll();
  }, 5000);
};

export const stopAutoSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};
