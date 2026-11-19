import { Candidate, Interview } from '@/types';
import { CheckCircle, Clock, AlertCircle, Briefcase, MapPin, CalendarCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ApplicationTimelineCardProps {
  application: Candidate;
  job?: {
    id: string;
    title: string;
    createdBy?: string;
    location: string;
  };
  interviews?: Interview[];
}

export function ApplicationTimelineCard({
  application,
  job,
  interviews = [],
}: ApplicationTimelineCardProps) {
  const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
    applied: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
      icon: 'text-blue-500',
    },
    screening: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-700 dark:text-purple-300',
      icon: 'text-purple-500',
    },
    shortlisted: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-700 dark:text-indigo-300',
      icon: 'text-indigo-500',
    },
    interview: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-700 dark:text-orange-300',
      icon: 'text-orange-500',
    },
    technical_test: {
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
      text: 'text-cyan-700 dark:text-cyan-300',
      icon: 'text-cyan-500',
    },
    hr_interview: {
      bg: 'bg-pink-50 dark:bg-pink-900/20',
      text: 'text-pink-700 dark:text-pink-300',
      icon: 'text-pink-500',
    },
    offer: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: 'text-emerald-500',
    },
    hired: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-300',
      icon: 'text-green-500',
    },
    rejected: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-300',
      icon: 'text-red-500',
    },
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      applied: 'Application Submitted',
      screening: 'Under Review',
      shortlisted: 'Shortlisted',
      interview: 'Interview Scheduled',
      technical_test: 'Technical Assessment',
      hr_interview: 'HR Interview',
      offer: 'Offer Extended',
      hired: 'Hired',
      rejected: 'Application Rejected',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hired':
        return <CheckCircle size={24} className={statusColors[status].icon} />;
      case 'rejected':
        return <AlertCircle size={24} className={statusColors[status].icon} />;
      case 'offer':
      case 'interview':
      case 'technical_test':
      case 'hr_interview':
        return <Clock size={24} className={statusColors[status].icon} />;
      default:
        return <Briefcase size={24} className={statusColors[status].icon} />;
    }
  };

  const colors = statusColors[application.status] || statusColors.applied;
  const statusLabel = getStatusLabel(application.status);
  const appliedDate = new Date(application.appliedDate);
  const formattedDate = appliedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Get upcoming interview if any
  const upcomingInterview = interviews
    .filter(i => i.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

  const interviewDate = upcomingInterview
    ? new Date(upcomingInterview.scheduledAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'rounded-xl border p-6 transition-all duration-200',
        colors.bg,
        'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
      )}
    >
      {/* Header: Job title and status */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          {job ? (
            <>
              <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 mb-1 line-clamp-2">
                {job.title}
              </h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 line-clamp-1">
                {job.createdBy || 'Employer'} • {job.location}
              </p>
            </>
          ) : (
            <div className="h-6 w-32 bg-surface-300 dark:bg-surface-700 rounded animate-pulse mb-1" />
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {getStatusIcon(application.status)}
          <span
            className={cn(
              'text-sm font-bold whitespace-nowrap px-3 py-1 rounded-lg',
              colors.text,
              colors.bg
            )}
          >
            {application.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Application details */}
      <div className="space-y-3 mb-4 pt-4 border-t border-surface-300 dark:border-surface-600">
        <div className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
          <CalendarCheck size={16} className="flex-shrink-0" />
          <span>Applied {formattedDate}</span>
        </div>

        {/* Interview information if scheduled */}
        {upcomingInterview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-3 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-300 dark:border-surface-700"
          >
            <div className="flex items-start gap-2">
              <Clock size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-surface-900 dark:text-surface-50">
                  Interview Scheduled
                </p>
                <p className="text-xs text-surface-600 dark:text-surface-400 mt-1">
                  {upcomingInterview.type.replace('_', ' ')} Interview
                </p>
                <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mt-2">
                  {interviewDate}
                </p>
                {upcomingInterview.notes && (
                  <p className="text-xs text-surface-600 dark:text-surface-400 mt-2 line-clamp-2">
                    {upcomingInterview.notes}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Status message */}
      <div className="pt-4 border-t border-surface-300 dark:border-surface-600">
        <p className="text-sm font-medium text-surface-900 dark:text-surface-50">{statusLabel}</p>
        <p className="text-xs text-surface-600 dark:text-surface-400 mt-1">
          {application.status === 'hired' &&
            'Congratulations! You have been hired. Check your email for next steps.'}
          {application.status === 'offer' && 'Great! You have received an offer. Review the details carefully.'}
          {application.status === 'interview' && 'You have an interview scheduled. Prepare and good luck!'}
          {application.status === 'shortlisted' && 'Excellent! You have been shortlisted for this position.'}
          {application.status === 'screening' && 'Your application is being reviewed by the employer.'}
          {application.status === 'applied' && 'Your application has been received and is under review.'}
          {application.status === 'rejected' && 'Unfortunately, your application was not selected this time.'}
          {application.status === 'technical_test' && 'You have been invited to complete a technical assessment.'}
          {application.status === 'hr_interview' && 'You are scheduled for an HR interview.'}
        </p>
      </div>
    </motion.div>
  );
}
