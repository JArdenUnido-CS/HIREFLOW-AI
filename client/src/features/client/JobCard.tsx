import { MapPin, Briefcase, DollarSign, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Job } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  index?: number;
}

export function JobCard({ job, index = 0 }: JobCardProps) {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) {
      return `$${(min / 1000).toFixed(0)}K - $${(max / 1000).toFixed(0)}K`;
    }
    if (min) return `$${(min / 1000).toFixed(0)}K+`;
    if (max) return `Up to $${(max / 1000).toFixed(0)}K`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const daysAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return 'Yesterday';
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const typeColors: Record<string, string> = {
    'full-time': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    'part-time': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
    'contract': 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
    'internship': 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    'remote': 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300',
  };

  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/client/jobs/${job.id}`}>
        <div className="group p-6 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-lg dark:hover:shadow-lg/30 transition-all duration-200 cursor-pointer">
          {/* Header with title and type badge */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                {job.title}
              </h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 truncate">
                {job.createdBy || job.hiringManager}
              </p>
            </div>
            <span className={cn('px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap', typeColors[job.type] || typeColors['full-time'])}>
              {job.type.replace('-', ' ')}
            </span>
          </div>

          {/* Location and other details */}
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
              <MapPin size={16} className="flex-shrink-0" />
              <span>{job.location}</span>
            </div>

            {salary && (
              <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                <DollarSign size={16} className="flex-shrink-0" />
                <span>{salary}</span>
              </div>
            )}

            {job.createdAt && (
              <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-500">
                <Calendar size={16} className="flex-shrink-0" />
                <span>{formatDate(job.createdAt)}</span>
              </div>
            )}
          </div>

          {/* Skills preview */}
          {job.skillsRequired && job.skillsRequired.length > 0 && (
            <div className="mb-4 pb-4 border-t border-surface-100 dark:border-surface-800">
              <div className="text-xs text-surface-500 font-medium mb-2">Required Skills</div>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.slice(0, 3).map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-surface-50 dark:bg-surface-800 text-xs text-surface-700 dark:text-surface-300"
                  >
                    {skill}
                  </span>
                ))}
                {job.skillsRequired.length > 3 && (
                  <span className="px-2.5 py-1 rounded-lg bg-surface-50 dark:bg-surface-800 text-xs text-surface-600 dark:text-surface-400">
                    +{job.skillsRequired.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Description preview */}
          <p className="text-sm text-surface-600 dark:text-surface-400 line-clamp-2 mb-4 group-hover:text-surface-700 dark:group-hover:text-surface-300 transition-colors">
            {job.description}
          </p>

          {/* Footer with applicant count and arrow */}
          <div className="flex items-center justify-between pt-4 border-t border-surface-100 dark:border-surface-800">
            <span className="text-xs text-surface-500 flex items-center gap-1">
              <Briefcase size={14} />
              {job.applicantCount || 0} applied
            </span>
            <ArrowRight
              size={18}
              className="text-surface-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transform group-hover:translate-x-1 transition-all"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
