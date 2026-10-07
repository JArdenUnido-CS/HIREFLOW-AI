import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Users, UserPlus, Calendar, XCircle, CheckCircle, Clock,
  TrendingUp, Target, ArrowUpRight, Briefcase,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/shared/PageTransition';
import { formatRelativeTime } from '@/lib/utils';
import { HiringFunnelChart } from './HiringFunnelChart';
import { RecentActivity } from './RecentActivity';
import { candidatesApi, jobsApi, interviewsApi, activitiesApi } from '@/services/api';

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    candidatesThisWeek: 0,
    interviewsScheduled: 0,
    pendingReview: 0,
    accepted: 0,
    rejected: 0,
    averageResumeScore: 0,
    averageMatchScore: 0,
  });

  const [hiringFunnelData, setHiringFunnelData] = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch candidates
        const candidatesRes = await candidatesApi.getAll({ limit: 1000 });
        const candidates = candidatesRes.data.candidates || [];

        // Fetch jobs
        const jobsRes = await jobsApi.getAll({ limit: 100 });
        const jobs = jobsRes.data.jobs || [];

        // Fetch interviews
        const interviewsRes = await interviewsApi.getUpcoming();
        const upcomingInterviewsList = interviewsRes.data.interviews || [];

        // Fetch activities
        const activitiesRes = await activitiesApi.getRecent(7);
        const activities = activitiesRes.data.activities || [];

        // Calculate stats
        const totalCandidates = candidates.length;
        const candidatesThisWeek = candidates.filter((c: any) => {
          const appliedDate = new Date(c.applied_at);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return appliedDate >= weekAgo;
        }).length;

        const interviewsScheduled = upcomingInterviewsList.length;
        const pendingReview = candidates.filter((c: any) => c.status === 'screening').length;
        const accepted = candidates.filter((c: any) => c.status === 'hired').length;
        const rejected = candidates.filter((c: any) => c.status === 'rejected').length;

        // Calculate average scores
        const avgResumeScore = Math.round(
          candidates.reduce((sum: number, c: any) => sum + (c.ai_scores?.overall || 0), 0) / Math.max(1, candidates.length)
        );
        const avgMatchScore = Math.round(
          candidates.reduce((sum: number, c: any) => sum + (c.match_scores?.overall || 0), 0) / Math.max(1, candidates.length)
        );

        setStats({
          totalCandidates,
          candidatesThisWeek,
          interviewsScheduled,
          pendingReview,
          accepted,
          rejected,
          averageResumeScore: avgResumeScore,
          averageMatchScore: avgMatchScore,
        });

        // Build hiring funnel data
        const funnel = [
          { label: 'Applied', value: candidates.filter((c: any) => c.status === 'applied').length, color: '#6b7a8d' },
          { label: 'Screening', value: candidates.filter((c: any) => c.status === 'screening').length, color: '#4c6ef5' },
          { label: 'Shortlisted', value: candidates.filter((c: any) => c.status === 'shortlisted').length, color: '#7c3aed' },
          { label: 'Interview', value: candidates.filter((c: any) => c.status === 'interview').length, color: '#f59e0b' },
          { label: 'Offer', value: candidates.filter((c: any) => c.status === 'offer').length, color: '#10b981' },
          { label: 'Hired', value: candidates.filter((c: any) => c.status === 'hired').length, color: '#059669' },
        ];
        setHiringFunnelData(funnel);

        setUpcomingInterviews(upcomingInterviewsList.slice(0, 5));
        setRecentActivities(activities.slice(0, 7));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Total Candidates', value: stats.totalCandidates, icon: Users, color: 'from-brand-500 to-brand-600', change: '+12%' },
    { label: 'This Week', value: stats.candidatesThisWeek, icon: UserPlus, color: 'from-violet-500 to-violet-600', change: '+8%' },
    { label: 'Interviews', value: stats.interviewsScheduled, icon: Calendar, color: 'from-amber-500 to-orange-500', change: '+5' },
    { label: 'Pending Review', value: stats.pendingReview, icon: Clock, color: 'from-cyan-500 to-blue-500', change: '-15' },
    { label: 'Accepted', value: stats.accepted, icon: CheckCircle, color: 'from-emerald-500 to-green-500', change: '+3' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'from-red-400 to-red-500', change: '+7' },
  ];

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-1/4 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
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
                      <AnimatedCounter value={stats.averageResumeScore} />
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
                      <AnimatedCounter value={stats.averageMatchScore} />
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
                {upcomingInterviews.length > 0 ? (
                  upcomingInterviews.map((interview: any) => (
                    <div key={interview.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-900/50 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                          {interview.candidateName}
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">
                          {formatRelativeTime(interview.scheduled_at)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-surface-500 dark:text-surface-400">No upcoming interviews</p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
