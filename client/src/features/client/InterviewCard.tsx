import { Interview } from '@/types';
import { Calendar, Clock, Briefcase, MapPin, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InterviewCardProps {
  interview: Interview;
  jobTitle?: string;
  index?: number;
}

export function InterviewCard({ interview, jobTitle, index = 0 }: InterviewCardProps) {
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    scheduled: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
    },
    completed: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    cancelled: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
    },
  };

  const typeLabels: Record<string, string> = {
    technical: 'Technical Interview',
    behavioral: 'Behavioral Interview',
    hr: 'HR Interview',
    coding: 'Coding Assessment',
    final: 'Final Round Interview',
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-emerald-500" />;
      case 'cancelled':
        return <AlertCircle size={20} className="text-red-500" />;
      default:
        return <Clock size={20} className="text-blue-500" />;
    }
  };

  const colors = statusColors[interview.status] || statusColors.scheduled;
  const typeLabel = typeLabels[interview.type] || interview.type;

  const interviewDate = new Date(interview.scheduledAt);
  const now = new Date();
  const isPast = interviewDate < now;

  const formattedDate = interviewDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = interviewDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const daysUntil = Math.ceil((interviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      className={cn(
        'rounded-xl border p-6 transition-all duration-200',
        colors.bg,
        colors.border
      )}
    >
      {/* Header with status */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 mb-1">
            {typeLabel}
          </h3>
          {jobTitle && (
            <p className="text-sm text-surface-600 dark:text-surface-400 line-clamp-1">
              {jobTitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {getStatusIcon(interview.status)}
          <span
            className={cn(
              'text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap',
              colors.text,
              colors.bg
            )}
          >
            {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Interview details */}
      <div className="space-y-3 mb-4">
        {/* Date and time */}
        <div className="flex items-center gap-3">
          <Calendar size={16} className="text-surface-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-surface-900 dark:text-surface-50">{formattedDate}</p>
            <p className="text-xs text-surface-600 dark:text-surface-400">{formattedTime}</p>
          </div>
        </div>

        {/* Days until/ago */}
        {interview.status === 'scheduled' && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800">
            <Clock size={16} className="text-brand-500 flex-shrink-0" />
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
              {daysUntil > 0
                ? `Interview in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`
                : 'Interview is today!'}
            </p>
          </div>
        )}

        {isPast && interview.status === 'scheduled' && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <AlertCircle size={16} className="text-orange-500 flex-shrink-0" />
            <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
              This interview date has passed
            </p>
          </div>
        )}
      </div>

      {/* Interview notes/instructions if available */}
      {interview.notes && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-4 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700"
        >
          <div className="flex gap-3">
            <FileText size={16} className="text-surface-600 dark:text-surface-400 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1">
                Interview Details
              </p>
              <p className="text-sm text-surface-600 dark:text-surface-400 whitespace-pre-wrap break-words">
                {interview.notes}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Interview questions if available */}
      {interview.questions && interview.questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 space-y-2"
        >
          <p className="text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wide">
            Interview Focus Areas
          </p>
          <ul className="space-y-2">
            {interview.questions.slice(0, 3).map((q: any, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-surface-600 dark:text-surface-400">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-surface-300 dark:bg-surface-700 flex items-center justify-center text-xs font-semibold text-surface-700 dark:text-surface-300">
                  {i + 1}
                </span>
                <span className="line-clamp-2">
                  {typeof q === 'string' ? q : q.question || q}
                </span>
              </li>
            ))}
            {interview.questions.length > 3 && (
              <li className="text-xs text-surface-500 italic">
                +{interview.questions.length - 3} more question{interview.questions.length - 3 !== 1 ? 's' : ''}
              </li>
            )}
          </ul>
        </motion.div>
      )}

      {/* Status message */}
      <div className="pt-4 border-t border-surface-200 dark:border-surface-700">
        <p className="text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wide mb-2">
          {interview.status === 'scheduled' && 'Prepare for Your Interview'}
          {interview.status === 'completed' && 'Interview Complete'}
          {interview.status === 'cancelled' && 'Interview Cancelled'}
        </p>
        <p className="text-sm text-surface-600 dark:text-surface-400">
          {interview.status === 'scheduled' &&
            'Review the interview details above and prepare your answers. Good luck!'}
          {interview.status === 'completed' &&
            'Thank you for attending. You should hear back from the employer soon.'}
          {interview.status === 'cancelled' &&
            'This interview has been cancelled. Please check your email for more information.'}
        </p>
      </div>
    </motion.div>
  );
}
