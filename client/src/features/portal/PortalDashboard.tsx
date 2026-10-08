import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

export function PortalDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    applicationsSubmitted: 0,
    jobsAvailable: 0,
    interviewsScheduled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get jobs count
      const jobsRes = await api.get('/api/jobs');
      // Get candidate applications
      const candidateRes = await api.get(`/api/candidates?email=${user?.email}`);
      
      setStats({
        jobsAvailable: jobsRes.data?.length || 0,
        applicationsSubmitted: candidateRes.data?.length || 0,
        interviewsScheduled: 0, // Placeholder
      });
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
          Your profile is live and visible to our admin team
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
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Your Profile is Active</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Your account has been created successfully! Admin team members can now see your profile and reach out to you with opportunities that match your qualifications.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default PortalDashboard;
