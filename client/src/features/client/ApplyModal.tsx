import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Job } from '@/types';
import { clientJobsApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ApplyModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 'review' | 'submitting' | 'success' | 'error';

export function ApplyModal({ job, isOpen, onClose, onSuccess }: ApplyModalProps) {
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>('review');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    resumeUrl: '',
    linkedIn: '',
    portfolio: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.location) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setStep('submitting');
    setError(null);

    try {
      await clientJobsApi.apply({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        jobId: job.id,
        resumeUrl: formData.resumeUrl || undefined,
        linkedIn: formData.linkedIn || undefined,
        portfolio: formData.portfolio || undefined,
      });

      setStep('success');
      toast.success(`Applied to ${job.title}!`);

      // Call success callback after delay
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit application';
      setError(message);
      setStep('error');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('review');
    setError(null);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      location: '',
      resumeUrl: '',
      linkedIn: '',
      portfolio: '',
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-surface-200 dark:border-surface-700">
              {/* Header */}
              <div className="sticky top-0 px-8 py-6 border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
                    {step === 'success' ? 'Application Sent!' : 'Apply for Position'}
                  </h2>
                  {step === 'review' && (
                    <p className="text-sm text-surface-500 mt-1">{job.title}</p>
                  )}
                </div>
                {step !== 'submitting' && (
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                    aria-label="Close"
                  >
                    <X size={24} className="text-surface-600 dark:text-surface-400" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="px-8 py-6">
                {step === 'review' && (
                  <div className="space-y-6">
                    {/* Job Summary */}
                    <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
                      <h3 className="font-semibold text-brand-900 dark:text-brand-100 mb-2">{job.title}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm text-brand-800 dark:text-brand-200">
                        <div>
                          <span className="font-medium">Company:</span> {job.createdBy || job.hiringManager}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {job.location}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {job.type.replace('-', ' ')}
                        </div>
                        {job.salaryMin && job.salaryMax && (
                          <div>
                            <span className="font-medium">Salary:</span> ${(job.salaryMin / 1000).toFixed(0)}K - ${(job.salaryMax / 1000).toFixed(0)}K
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      {/* Error message */}
                      {error && (
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-3">
                          <AlertCircle className="flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" size={20} />
                          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Your name"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-50 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your@email.com"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-50 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="(555) 123-4567"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-50 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Location */}
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Location *
                          </label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="City, State"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-50 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      {/* Optional fields */}
                      <div className="pt-4 border-t border-surface-200 dark:border-surface-700 space-y-4">
                        <p className="text-xs text-surface-500 uppercase tracking-wide">Optional Information</p>

                        {/* Resume URL */}
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Resume URL
                          </label>
                          <input
                            type="url"
                            name="resumeUrl"
                            value={formData.resumeUrl}
                            onChange={handleInputChange}
                            placeholder="https://example.com/resume.pdf"
                            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-50 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                          />
                        </div>

                        {/* LinkedIn */}
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            LinkedIn Profile
                          </label>
                          <input
                            type="url"
                            name="linkedIn"
                            value={formData.linkedIn}
                            onChange={handleInputChange}
                            placeholder="https://linkedin.com/in/yourprofile"
                            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-50 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Portfolio */}
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                            Portfolio Website
                          </label>
                          <input
                            type="url"
                            name="portfolio"
                            value={formData.portfolio}
                            onChange={handleInputChange}
                            placeholder="https://yourportfolio.com"
                            className="w-full px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-50 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3 pt-6 border-t border-surface-200 dark:border-surface-700">
                        <button
                          type="button"
                          onClick={handleClose}
                          className="flex-1 px-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Submit Application
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {step === 'submitting' && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader size={48} className="text-brand-600 dark:text-brand-400 animate-spin" />
                    <p className="text-lg font-medium text-surface-900 dark:text-surface-50">
                      Submitting your application...
                    </p>
                  </div>
                )}

                {step === 'success' && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <CheckCircle size={48} className="text-emerald-600 dark:text-emerald-400" />
                    <div className="text-center space-y-2">
                      <p className="text-lg font-medium text-surface-900 dark:text-surface-50">
                        Application sent successfully!
                      </p>
                      <p className="text-sm text-surface-600 dark:text-surface-400">
                        You can track your application in the Applications section.
                      </p>
                    </div>
                  </div>
                )}

                {step === 'error' && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <AlertCircle size={48} className="text-red-600 dark:text-red-400" />
                    <div className="text-center space-y-4">
                      <div>
                        <p className="text-lg font-medium text-surface-900 dark:text-surface-50">
                          Something went wrong
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
                      </div>
                      <button
                        onClick={() => setStep('review')}
                        className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-medium transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
