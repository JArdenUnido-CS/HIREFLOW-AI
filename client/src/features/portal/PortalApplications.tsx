import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/shared/PageTransition';
import { sampleJobs, sampleCandidates } from '@/data/sampleData';
import { formatDate, formatSalary } from '@/lib/utils';

const stageLabels: Record<string, string> = {
  applied: 'Applied',
  screening: 'Under Review',
  shortlisted: 'Shortlisted',
  interview: 'Interview Stage',
  technical_test: 'Technical Assessment',
  hr_interview: 'HR Interview',
  offer: 'Offer Extended',
  hired: 'Hired',
  rejected: 'Not Selected',
};

const stageVariant: Record<string, 'default' | 'info' | 'warning' | 'success' | 'danger' | 'brand'> = {
  applied: 'default',
  screening: 'info',
  shortlisted: 'brand',
  interview: 'warning',
  technical_test: 'info',
  hr_interview: 'warning',
  offer: 'success',
  hired: 'success',
  rejected: 'danger',
};

export function PortalApplications() {
  const candidate = sampleCandidates[0];
  const appliedJob = sampleJobs.find((j) => j.id === candidate.jobId);

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">My Applications</h1>
          <p className="text-surface-500 mt-1">Track the status of your job applications</p>
        </div>

        <StaggerContainer className="space-y-4">
          {/* Active application */}
          {appliedJob && (
            <StaggerItem>
              <Card hover className="relative overflow-hidden cursor-pointer">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-500 to-violet-500 rounded-l-2xl" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-3">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 dark:from-brand-900/20 dark:to-violet-900/20 flex items-center justify-center border border-brand-100 dark:border-brand-800/30 shrink-0">
                      <Briefcase size={20} className="text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-white">{appliedJob.title}</h3>
                      <p className="text-sm text-surface-500">{appliedJob.department}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-surface-400">
                        <span className="flex items-center gap-1"><MapPin size={12} />{appliedJob.location}</span>
                        <span className="flex items-center gap-1"><Clock size={12} />{appliedJob.type}</span>
                        <span>{formatSalary(appliedJob.salaryMin, appliedJob.salaryMax)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 pl-3 sm:pl-0">
                    <Badge variant={stageVariant[candidate.status]} size="md">
                      {stageLabels[candidate.status]}
                    </Badge>
                    <span className="text-xs text-surface-400">Applied {formatDate(candidate.appliedDate)}</span>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          )}

          {/* Other job suggestions shown as "not yet applied" */}
          <div className="pt-4">
            <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-3">Open Positions</h3>
          </div>
          {sampleJobs.filter((j) => j.id !== candidate.jobId).map((job) => (
            <StaggerItem key={job.id}>
              <Card hover className="cursor-pointer group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0">
                      <Briefcase size={20} className="text-surface-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-sm text-surface-500">{job.department}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-surface-400">
                        <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
                        <span className="flex items-center gap-1"><Clock size={12} />{job.type}</span>
                        <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.skillsRequired.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="default" size="sm">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-4 sm:pl-0">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-colors"
                    >
                      Apply
                    </motion.button>
                    <button className="p-2 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}
