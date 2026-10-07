import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, Users, DollarSign, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/shared/PageTransition';
import { CreateJobModal } from './CreateJobModal';
import { jobsApi } from '@/services/api';
import { formatSalary, formatDate } from '@/lib/utils';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  open: 'success',
  paused: 'warning',
  closed: 'danger',
  draft: 'default',
};

export function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsApi.getAll({ limit: 100 });
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-1/4 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Jobs</h1>
            <p className="text-surface-500 mt-1">{jobs.length} active positions</p>
          </div>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
            Create Job
          </Button>
        </div>

        {/* Job Cards */}
        {jobs.length === 0 ? (
          <Card className="text-center py-12">
            <Briefcase size={48} className="mx-auto text-surface-400 mb-4" />
            <p className="text-surface-600 dark:text-surface-400">No jobs found</p>
          </Card>
        ) : (
          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <StaggerItem key={job.id}>
                <Card hover className="cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 dark:from-brand-900/20 dark:to-violet-900/20 flex items-center justify-center border border-brand-100 dark:border-brand-800/30">
                        <Briefcase size={18} className="text-brand-600 dark:text-brand-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-sm text-surface-500">{job.department}</p>
                      </div>
                    </div>
                    <Badge variant={statusVariant[job.status]}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </div>

                  <p className="text-sm text-surface-600 dark:text-surface-400 mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-surface-500 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} /> {job.location}
                    </span>
                    {job.salary_min && job.salary_max && (
                      <span className="flex items-center gap-1">
                        <DollarSign size={13} /> {formatSalary(job.salary_min, job.salary_max)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {job.type}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(job.skills_required || []).slice(0, 4).map((skill: string) => (
                      <Badge key={skill} variant="brand" size="sm">{skill}</Badge>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-surface-100 dark:border-surface-800">
                    <div className="flex items-center gap-1.5 text-surface-500">
                      <Users size={14} />
                      <span className="text-sm font-medium">{job.applicant_count} applicants</span>
                    </div>
                    {job.deadline && (
                      <span className="text-xs text-surface-400">
                        Deadline: {formatDate(job.deadline)}
                      </span>
                    )}
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
      <CreateJobModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSuccess={fetchJobs}
      />
    </PageTransition>
  );
}
