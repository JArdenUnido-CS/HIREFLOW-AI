import { motion } from 'framer-motion';
import {
  Users, UserPlus, Calendar, XCircle, CheckCircle, Clock,
  TrendingUp, Target, ArrowUpRight, Briefcase,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/shared/PageTransition';
import { dashboardStats, sampleActivities, sampleInterviews, hiringFunnelData } from '@/data/sampleData';
import { formatRelativeTime } from '@/lib/utils';
import { HiringFunnelChart } from './HiringFunnelChart';
import { RecentActivity } from './RecentActivity';

const statCards = [
  { label: 'Total Candidates', value: dashboardStats.totalCandidates, icon: Users, color: 'from-brand-500 to-brand-600', change: '+12%' },
  { label: 'This Week', value: dashboardStats.candidatesThisWeek, icon: UserPlus, color: 'from-violet-500 to-violet-600', change: '+8%' },
  { label: 'Interviews', value: dashboardStats.interviewsScheduled, icon: Calendar, color: 'from-amber-500 to-orange-500', change: '+5' },
  { label: 'Pending Review', value: dashboardStats.pendingReview, icon: Clock, color: 'from-cyan-500 to-blue-500', change: '-15' },
  { label: 'Accepted', value: dashboardStats.accepted, icon: CheckCircle, color: 'from-emerald-500 to-green-500', change: '+3' },
  { label: 'Rejected', value: dashboardStats.rejected, icon: XCircle, color: 'from-red-400 to-red-500', change: '+7' },
];

export function DashboardPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
              Good morning, Jem
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mt-1">
              Here's what's happening with your recruitment pipeline today.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-violet-600 text-white text-sm font-medium shadow-glow hover:shadow-glow-lg transition-shadow"
          >
            <Briefcase size={16} />
            Post New Job
          </motion.button>
        </div>

        {/* Stat Cards */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((stat) => (
            <StaggerItem key={stat.label}>
              <Card hover className="relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <div className="mt-2 text-2xl font-bold text-surface-900 dark:text-white">
                      <AnimatedCounter value={stat.value} />
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <ArrowUpRight size={12} className="text-emerald-500" />
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                    <stat.icon size={18} className="text-white" />
                  </div>
                </div>
                {/* Decorative gradient */}
                <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-5 blur-xl`} />
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Score Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/10 to-violet-500/10 dark:from-brand-500/20 dark:to-violet-500/20 flex items-center justify-center">
                  <TrendingUp size={24} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Avg Resume Score</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-surface-900 dark:text-white">
                      <AnimatedCounter value={dashboardStats.averageResumeScore} />
                    </span>
                    <span className="text-sm text-surface-400">/100</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:to-cyan-500/20 flex items-center justify-center">
                  <Target size={24} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Avg Match Score</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-surface-900 dark:text-white">
                      <AnimatedCounter value={dashboardStats.averageMatchScore} />
                    </span>
                    <span className="text-sm text-surface-400">/100</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Charts + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-2"
          >
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">
                Hiring Funnel
              </h3>
              <HiringFunnelChart data={hiringFunnelData} />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card padding="lg" className="h-full">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                Upcoming Interviews
              </h3>
              <div className="space-y-3">
                {sampleInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700/30"
                  >
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200">
                      {interview.candidateName}
                    </p>
                    <p className="text-xs text-surface-500 mt-0.5">{interview.jobTitle}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar size={12} className="text-brand-500" />
                      <span className="text-xs text-surface-500">
                        {formatRelativeTime(interview.scheduledAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <RecentActivity activities={sampleActivities} />
        </motion.div>
      </div>
    </PageTransition>
  );
}
