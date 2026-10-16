import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Send, FileText, CheckCircle, Clock, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { api } from '@/services/api';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  description: string;
}

export function CandidatePortalPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error('Failed to load job openings');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!resumeUrl.trim()) {
      toast.error('Please provide your resume URL');
      return;
    }

    setSubmitting(true);
    try {
      // Update candidate with job application
      await api.patch(`/api/candidates/${user?.id}`, {
        job_id: jobId,
        resume_url: resumeUrl,
        status: 'applied',
      });

      toast.success('Application submitted! Admin will review your profile.');
      setResumeUrl('');
      setSelectedJob(null);
      
      // Refresh jobs to show updated status
      fetchJobs();
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Briefcase size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-surface-900 dark:text-white">HireFlow Candidate</h1>
              <p className="text-xs text-surface-500">Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-surface-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-surface-500">{user?.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-3">
            Welcome, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-lg text-surface-600 dark:text-surface-400">
            Your profile has been created and is now visible to our admin team. Browse open positions and apply below.
          </p>
        </motion.div>

        {/* Jobs grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-surface-500">
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
              Loading job opportunities...
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800"
          >
            <Briefcase size={48} className="mx-auto text-surface-300 mb-3" />
            <p className="text-lg text-surface-600 dark:text-surface-400">No job openings yet</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 hover:shadow-lg transition-all"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                      <Briefcase size={16} />
                      {job.department}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                      <MapPin size={16} />
                      {job.location}
                    </div>
                    {job.salary_min && (
                      <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                        <DollarSign size={16} />
                        ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-surface-600 dark:text-surface-400 text-sm mb-4 line-clamp-2">
                  {job.description}
                </p>

                <Button
                  variant="primary"
                  className="w-full"
                  size="sm"
                  onClick={() => setSelectedJob(job.id)}
                  icon={<Send size={14} />}
                >
                  Apply Now
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Application modal */}
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedJob(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-surface-900 rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">
                Apply to {jobs.find(j => j.id === selectedJob)?.title}
              </h3>
              <p className="text-surface-600 dark:text-surface-400 mb-6">
                Share your resume URL to apply for this position. Our admin team will review your application.
              </p>

              <div className="space-y-4 mb-6">
                <Input
                  label="Resume URL"
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://example.com/resume.pdf"
                  icon={<FileText size={18} />}
                />
                <p className="text-xs text-surface-500">
                  💡 Tip: You can link to a PDF on Google Drive, Dropbox, or your personal website
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setSelectedJob(null)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  loading={submitting}
                  onClick={() => handleApply(selectedJob)}
                  icon={<Send size={14} />}
                >
                  Submit
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Info section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-gradient-to-r from-brand-50 to-violet-50 dark:from-brand-900/20 dark:to-violet-900/20 rounded-2xl p-8 border border-brand-200 dark:border-brand-800"
        >
          <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-3 flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-500" />
            Your Profile Status
          </h3>
          <div className="space-y-2 text-sm text-surface-700 dark:text-surface-300">
            <p className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" />
              ✅ Account created and verified
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" />
              ✅ Profile visible to admin team
            </p>
            <p className="flex items-center gap-2">
              <Clock size={16} className="text-brand-500" />
              ⏳ Waiting for applications to be reviewed
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
