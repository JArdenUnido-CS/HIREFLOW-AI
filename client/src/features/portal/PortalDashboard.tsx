import { motion } from 'framer-motion';
import { Briefcase, Clock, CheckCircle, FileText, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/shared/PageTransition';
import { RadialProgress } from '@/components/shared/RadialProgress';
import { useAuthStore } from '@/stores/authStore';
import { sampleCandidates, sampleJobs } from '@/data/sampleData';

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

const stageProgress: Record<string, number> = {
  applied: 12,
  screening: 25,
  shortlisted: 40,
  interview: 55,
  technical_test: 68,
  hr_interview: 80,
  offer: 92,
  hired: 100,
  rejected: 0,
};

export function PortalDashboard() {
  const { user } = useAuthStore();
  // Use Emily Zhang's data as the demo candidate
  const candidate = sampleCandidates[0];
  const appliedJob = sampleJobs.find((j) => j.id === candidate.jobId);

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-surface-500 mt-1">
            Track your applications and stay updated on your hiring journey.
          </p>
        </div>

        {/* Application Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden" padding="lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-brand-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <Badge variant="brand" size="md">Active Application</Badge>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white mt-3">
                    {appliedJob?.title}
                  </h2>
                  <p className="text-surface-500 mt-1">
                    {appliedJob?.department} · {appliedJob?.location}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                      {stageLabels[candidate.status]}
                    </span>
                  </div>
                </div>
                <RadialProgress value={stageProgress[candidate.status]} size={100} label="Progress" />
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs text-surface-400 mb-2">
                  <span>Applied</span>
                  <span>Hired</span>
                </div>
                <div className="h-2 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stageProgress[candidate.status]}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
                  />
                </div>
                {/* Stage dots */}
                <div className="flex justify-between mt-3">
                  {['applied', 'screening', 'shortlisted', 'interview', 'technical_test', 'offer', 'hired'].map((stage) => {
                    const isPast = stageProgress[stage] <= stageProgress[candidate.status];
                    const isCurrent = stage === candidate.status;
                    return (
                      <div key={stage} className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${isCurrent ? 'bg-brand-500 ring-4 ring-brand-500/20' : isPast ? 'bg-brand-500' : 'bg-surface-200 dark:bg-surface-700'}`} />
                        <span className={`text-[10px] mt-1 hidden sm:block ${isCurrent ? 'text-brand-600 font-medium' : 'text-surface-400'}`}>
                          {stageLabels[stage]?.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Row */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StaggerItem>
            <Card hover>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                  <Briefcase size={18} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-surface-500">Applications</p>
                  <p className="text-xl font-bold text-surface-900 dark:text-white">
                    <AnimatedCounter value={1} />
                  </p>
                </div>
              </div>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card hover>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <Calendar size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-surface-500">Upcoming Interviews</p>
                  <p className="text-xl font-bold text-surface-900 dark:text-white">
                    <AnimatedCounter value={1} />
                  </p>
                </div>
              </div>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card hover>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                  <Sparkles size={18} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-surface-500">Match Score</p>
                  <p className="text-xl font-bold text-surface-900 dark:text-white">
                    <AnimatedCounter value={candidate.matchScores?.overall || 0} suffix="%" />
                  </p>
                </div>
              </div>
            </Card>
          </StaggerItem>
        </StaggerContainer>

        {/* Two column: Next Steps + Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Next Steps */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Next Steps</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800/30">
                  <Calendar size={18} className="text-brand-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200">Technical Interview</p>
                    <p className="text-xs text-surface-500 mt-0.5">Scheduled for August 2, 2026 at 10:00 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <FileText size={18} className="text-surface-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200">Prepare for interview</p>
                    <p className="text-xs text-surface-500 mt-0.5">Review system design and React architecture topics</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <CheckCircle size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200">Resume reviewed</p>
                    <p className="text-xs text-surface-500 mt-0.5">Your resume has been reviewed and shortlisted</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Profile Completeness */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Your Profile</h3>
              <div className="space-y-3">
                {[
                  { label: 'Resume uploaded', done: true },
                  { label: 'Contact information', done: true },
                  { label: 'Work experience', done: true },
                  { label: 'Education', done: true },
                  { label: 'Skills & certifications', done: true },
                  { label: 'Portfolio / GitHub', done: true },
                  { label: 'Profile photo', done: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-surface-100 dark:bg-surface-800'}`}>
                      {item.done ? (
                        <CheckCircle size={12} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Clock size={12} className="text-surface-400" />
                      )}
                    </div>
                    <span className={`text-sm ${item.done ? 'text-surface-700 dark:text-surface-300' : 'text-surface-400'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-500">Profile completeness</span>
                  <span className="font-semibold text-emerald-600">86%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-100 dark:bg-surface-800 mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '86%' }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="h-full rounded-full bg-emerald-500"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Job Recommendations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Recommended Jobs</h3>
              <button className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sampleJobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl border border-surface-200 dark:border-surface-700/50 hover:border-brand-200 dark:hover:border-brand-800/30 hover:shadow-sm transition-all cursor-pointer"
                >
                  <h4 className="text-sm font-semibold text-surface-800 dark:text-surface-200">{job.title}</h4>
                  <p className="text-xs text-surface-500 mt-0.5">{job.department} · {job.location}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="default" size="sm">{job.type}</Badge>
                    <span className="text-xs text-surface-400">{job.applicantCount} applicants</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
