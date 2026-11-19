import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { api, interviewsApi } from '@/services/api';
import { Interview } from '@/types';
import { InterviewCard } from '@/features/client/InterviewCard';
import toast from 'react-hot-toast';

export function PortalDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    applicationsSubmitted: 0,
    jobsAvailable: 0,
    interviewsScheduled: 0,
  });
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user?.email]);

  const fetchStats = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);

      // Get jobs count
      const jobsRes = await api.get('/jobs');
      
      // Get candidate applications
      const candidateRes = await api.get(`/candidates?email=${user.email}`);
      const applications = candidateRes.data?.candidates || candidateRes.data || [];

      // Get upcoming interviews
      let interviews: Interview[] = [];
      try {
        const interviewsRes = await interviewsApi.getUpcoming();
        interviews = interviewsRes.data?.interviews || [];
      } catch (err) {
        console.log('Could not fetch upcoming interviews:', err);
      }

      setStats({
        jobsAvailable: jobsRes.data?.jobs?.length || jobsRes.data?.length || 0,
        applicationsSubmitted: Array.isArray(applications) ? applications.length : 0,
        interviewsScheduled: interviews.filter(i => i.status === 'scheduled').length,
      });

      setUpcomingInterviews(
        interviews
          .filter(i => i.status === 'scheduled')
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
          .slice(0, 3)
      );
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: Briefcase,
      label: 'Jobs Available',
      value: stats.jobsAvailable,
      color: 'brand',
    },
    {
      icon: CheckCircle,
      label: 'Applications Submitted',
      value: stats.applicationsSubmitted,
      color: 'emerald',
    },
    {
      icon: Clock,
      label: 'Interviews Scheduled',
      value: stats.interviewsScheduled,
      color: 'orange',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-surface-900 dark:text-white mb-2">
          Welcome, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-lg text-surface-600 dark:text-surface-400">
          Track your applications and upcoming interviews
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const colorClass = {
            brand: 'from-brand-500 to-brand-600',
            emerald: 'from-emerald-500 to-emerald-600',
            orange: 'from-orange-500 to-orange-600',
          }[card.color];

          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} text-white`}>
                  <Icon size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-surface-900 dark:text-white mb-1">
                {loading ? '...' : card.value}
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Upcoming interviews section */}
      {upcomingInterviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Upcoming Interviews</h2>
            <motion.a
              href="/client/applications"
              whileHover={{ scale: 1.05 }}
              className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              View all →
            </motion.a>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingInterviews.map((interview, i) => (
              <InterviewCard key={interview.id} interview={interview} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Info section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6"
      >
        <div className="flex gap-4">
          <AlertCircle size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Stay Organized</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Your applications are tracked here. Check back often to see updates from employers and prepare for your interviews.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default PortalDashboard;
