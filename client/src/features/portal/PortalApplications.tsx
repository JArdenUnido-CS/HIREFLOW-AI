import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

export function PortalApplications() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get(`/api/candidates?email=${user?.email}`);
      setApplications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hired':
        return <CheckCircle size={20} className="text-emerald-500" />;
      case 'offer':
      case 'technical_test':
      case 'interview':
        return <Clock size={20} className="text-blue-500" />;
      default:
        return <AlertCircle size={20} className="text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      applied: 'Applied',
      screening: 'Under Review',
      interview: 'Interview Scheduled',
      technical_test: 'Technical Assessment',
      offer: 'Offer Extended',
      hired: 'Hired',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Your Applications</h1>
        <p className="text-lg text-surface-600 dark:text-surface-400">Track your job applications and their status</p>
      </motion.div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-surface-500">
            <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
            Loading applications...
          </div>
        </div>
      ) : applications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800"
        >
          <p className="text-lg text-surface-600 dark:text-surface-400">No applications yet</p>
          <p className="text-sm text-surface-500">Browse job openings and apply to get started</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any, i: number) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 flex items-start justify-between"
            >
              <div className="flex-1">
                <h3 className="font-bold text-surface-900 dark:text-white mb-1">{app.name}</h3>
                <p className="text-sm text-surface-500">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusIcon(app.status)}
                <span className="text-sm font-medium text-surface-600 dark:text-surface-400 min-w-max">
                  {getStatusLabel(app.status)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PortalApplications;
