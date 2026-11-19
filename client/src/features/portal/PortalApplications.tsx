import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, AlertCircle, Loader } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { api, interviewsApi } from '@/services/api';
import { Candidate, Job, Interview } from '@/types';
import { ApplicationTimelineCard } from '@/features/client/ApplicationTimelineCard';
import toast from 'react-hot-toast';

interface ApplicationWithDetails {
  application: Candidate;
  job?: Job;
  interviews: Interview[];
}

export function PortalApplications() {
  const { user } = useAuthStore();
  const [applicationsWithDetails, setApplicationsWithDetails] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplicationsWithDetails();
  }, [user?.email]);

  const fetchApplicationsWithDetails = async () => {
    if (!user?.email || user.role !== 'client') return;

    setLoading(true);
    setError(null);

    try {
      // Fetch applications for current user
      const candidatesRes = await api.get(`/candidates?email=${user.email}`);
      const applications: Candidate[] = candidatesRes.data?.candidates || candidatesRes.data || [];

      if (applications.length === 0) {
        setApplicationsWithDetails([]);
        return;
      }

      // Fetch details for each application
      const detailedApplications = await Promise.all(
        applications.map(async (app: Candidate) => {
          let job: Job | undefined;
          let interviews: Interview[] = [];

          try {
            // Fetch job details if job_id exists
            if (app.jobId) {
              const jobRes = await api.get(`/jobs/${app.jobId}`);
              job = jobRes.data?.job;
            }

            // Fetch interviews for this candidate
            try {
              const interviewsRes = await interviewsApi.getByCandidateId(app.id);
              interviews = interviewsRes.data?.interviews || [];
            } catch (err) {
              // If candidateId filter not supported, try fetching all and filtering
              console.log('Could not fetch interviews with candidateId filter:', err);
            }
          } catch (err) {
            console.error('Error fetching application details:', err);
          }

          return {
            application: app,
            job,
            interviews,
          };
        })
      );

      setApplicationsWithDetails(detailedApplications);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load applications';
      setError(message);
      console.error('Failed to fetch applications:', err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-50 mb-2">Your Applications</h1>
        <p className="text-lg text-surface-600 dark:text-surface-400">
          Track your job applications and see the status of each one
        </p>
      </motion.div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-16"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader size={40} className="text-brand-500 animate-spin" />
            <p className="text-surface-600 dark:text-surface-400">Loading your applications...</p>
          </div>
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-6"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400 mt-1 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300 mb-1">Error Loading Applications</h3>
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </motion.div>
      ) : applicationsWithDetails.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50 p-12 text-center"
        >
          <Briefcase className="mx-auto mb-3 text-surface-400 dark:text-surface-600" size={40} />
          <p className="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-1">No applications yet</p>
          <p className="text-surface-600 dark:text-surface-400">
            Start applying to jobs to track your application progress here
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {applicationsWithDetails.map((item, i) => (
            <ApplicationTimelineCard
              key={item.application.id}
              application={item.application}
              job={
                item.job
                  ? {
                      id: item.job.id,
                      title: item.job.title,
                      createdBy: item.job.createdBy,
                      location: item.job.location,
                    }
                  : undefined
              }
              interviews={item.interviews}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PortalApplications;
