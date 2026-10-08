import { useEffect } from 'react';
import { useRecruitmentStore, startAutoSync, stopAutoSync } from '@/stores/recruitmentStore';

/**
 * Hook to access recruitment data and auto-sync across all pages
 * Usage: const { candidates, jobs, interviews } = useRecruitment();
 */
export function useRecruitment() {
  const candidates = useRecruitmentStore((state) => state.candidates);
  const jobs = useRecruitmentStore((state) => state.jobs);
  const interviews = useRecruitmentStore((state) => state.interviews);
  const loading = useRecruitmentStore((state) => state.loading);
  const error = useRecruitmentStore((state) => state.error);

  // Actions
  const syncAll = useRecruitmentStore((state) => state.syncAll);
  const fetchCandidates = useRecruitmentStore((state) => state.fetchCandidates);
  const fetchJobs = useRecruitmentStore((state) => state.fetchJobs);
  const fetchInterviews = useRecruitmentStore((state) => state.fetchInterviews);
  const addCandidate = useRecruitmentStore((state) => state.addCandidate);
  const updateCandidate = useRecruitmentStore((state) => state.updateCandidate);
  const deleteCandidate = useRecruitmentStore((state) => state.deleteCandidate);
  const addJob = useRecruitmentStore((state) => state.addJob);
  const updateJob = useRecruitmentStore((state) => state.updateJob);
  const deleteJob = useRecruitmentStore((state) => state.deleteJob);
  const addInterview = useRecruitmentStore((state) => state.addInterview);
  const updateInterview = useRecruitmentStore((state) => state.updateInterview);
  const deleteInterview = useRecruitmentStore((state) => state.deleteInterview);

  // Initialize auto-sync on component mount
  useEffect(() => {
    startAutoSync();
    // Initial sync
    syncAll();

    return () => {
      // Note: we don't stop auto-sync here as other components might need it
    };
  }, [syncAll]);

  return {
    // State
    candidates,
    jobs,
    interviews,
    loading,
    error,

    // Actions
    syncAll,
    fetchCandidates,
    fetchJobs,
    fetchInterviews,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    addJob,
    updateJob,
    deleteJob,
    addInterview,
    updateInterview,
    deleteInterview,
  };
}
