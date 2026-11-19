import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, DollarSign, Calendar, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { clientJobsApi } from '@/services/api';
import { Job } from '@/types';
import { ApplyModal } from './ApplyModal';
import toast from 'react-hot-toast';

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setError('Job ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await clientJobsApi.getById(jobId);
        setJob(response.data.job);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch job details';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader size={48} className="text-brand-600 dark:text-brand-400 animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-8 text-center space-y-4"
      >
        <AlertCircle className="mx-auto text-red-600 dark:text-red-400" size={48} />
        <div>
          <p className="text-red-700 dark:text-red-300 font-medium text-lg">{error || 'Job not found'}</p>
          <button
            onClick={() => navigate('/client/jobs')}
            className="mt-4 inline-block px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-medium transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </motion.div>
    );
  }

  const typeColors: Record<string, string> = {
    'full-time': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    'part-time': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
    'contract': 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
    'internship': 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    'remote': 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300',
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) {
      return `$${(min / 1000).toFixed(0)}K - $${(max / 1000).toFixed(0)}K per year`;
    }
    if (min) return `$${(min / 1000).toFixed(0)}K+ per year`;
    if (max) return `Up to $${(max / 1000).toFixed(0)}K per year`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/client/jobs')}
            className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
            aria-label="Back to jobs"
          >
            <ArrowLeft size={24} className="text-surface-600 dark:text-surface-400" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-surface-900 dark:text-surface-50">{job.title}</h1>
            <p className="text-lg text-surface-600 dark:text-surface-400 mt-1">{job.createdBy || job.hiringManager}</p>
          </div>
        </div>

        {/* Key details grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Location */}
          <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50">
            <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400 mb-2">
              <MapPin size={18} />
              <span className="text-sm font-medium">Location</span>
            </div>
            <p className="text-lg font-semibold text-surface-900 dark:text-surface-50">{job.location}</p>
          </div>

          {/* Employment Type */}
          <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50">
            <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400 mb-2">
              <Briefcase size={18} />
              <span className="text-sm font-medium">Type</span>
            </div>
            <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${typeColors[job.type] || typeColors['full-time']}`}>
              {job.type.replace('-', ' ')}
            </span>
          </div>

          {/* Salary */}
          {salary && (
            <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50">
              <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400 mb-2">
                <DollarSign size={18} />
                <span className="text-sm font-medium">Salary</span>
              </div>
              <p className="text-lg font-semibold text-surface-900 dark:text-surface-50">{salary}</p>
            </div>
          )}

          {/* Posted Date */}
          {job.createdAt && (
            <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50">
              <div className="flex items-center gap-2 text-surface-600 dark:text-surface-400 mb-2">
                <Calendar size={18} />
                <span className="text-sm font-medium">Posted</span>
              </div>
              <p className="text-lg font-semibold text-surface-900 dark:text-surface-50">{formatDate(job.createdAt)}</p>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Job details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {job.description && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50">About this role</h2>
                <div className="prose prose-invert max-w-none text-surface-700 dark:text-surface-300 leading-relaxed">
                  {job.description.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Responsibilities</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((responsibility, i) => (
                    <li key={i} className="flex gap-3 text-surface-700 dark:text-surface-300">
                      <CheckCircle size={20} className="flex-shrink-0 text-brand-600 dark:text-brand-400 mt-0.5" />
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Required Skills */}
            {job.skillsRequired && job.skillsRequired.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skillsRequired.map((skill, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-medium border border-brand-200 dark:border-brand-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Preferred Skills */}
            {job.skillsPreferred && job.skillsPreferred.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Preferred Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skillsPreferred.map((skill, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-medium border border-surface-300 dark:border-surface-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Experience & Education */}
            <div className="grid grid-cols-2 gap-6">
              {job.experienceYears !== undefined && job.experienceYears !== null && (
                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50">Experience</h3>
                  <p className="text-surface-700 dark:text-surface-300">
                    {job.experienceYears === 0 ? 'Entry level' : `${job.experienceYears}+ years`}
                  </p>
                </section>
              )}
              {job.education && (
                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50">Education</h3>
                  <p className="text-surface-700 dark:text-surface-300">{job.education}</p>
                </section>
              )}
            </div>

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Benefits</h2>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, i) => (
                    <li key={i} className="flex gap-3 text-surface-700 dark:text-surface-300">
                      <CheckCircle size={20} className="flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Right column - Apply section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-6 space-y-4 p-6 rounded-xl border border-surface-200 dark:border-surface-700 bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-900/20 dark:to-brand-800/10"
            >
              <div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 mb-2">Ready to apply?</h3>
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  Submit your application and let employers know you're interested.
                </p>
              </div>

              <button
                onClick={() => setApplyModalOpen(true)}
                className="w-full px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                Apply Now
              </button>

              {/* Quick stats */}
              <div className="pt-4 border-t border-brand-200 dark:border-brand-800 space-y-3">
                <div className="text-sm">
                  <p className="text-brand-900 dark:text-brand-100 font-medium">{job.applicantCount || 0}</p>
                  <p className="text-brand-800 dark:text-brand-200">Already applied</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Apply Modal */}
      <ApplyModal
        job={job}
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSuccess={() => {
          // Optionally refresh job data or navigate to applications
          navigate('/client/applications');
        }}
      />
    </>
  );
}
