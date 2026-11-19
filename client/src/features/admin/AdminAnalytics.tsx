import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { TrendingUp, Users, Briefcase, FileText } from 'lucide-react';

interface ActivityData {
  date: string;
  users: number;
  jobs: number;
  candidates: number;
}

export function AdminAnalytics() {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchActivityData(token);
    }
  }, []);

  const fetchActivityData = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/admin/activity-summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setActivityData(data);
      } else {
        toast.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getTotalUsers = () => activityData.reduce((sum, d) => sum + d.users, 0);
  const getTotalJobs = () => activityData.reduce((sum, d) => sum + d.jobs, 0);
  const getTotalCandidates = () => activityData.reduce((sum, d) => sum + d.candidates, 0);
  const getMaxUsers = () => Math.max(...activityData.map(d => d.users), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-surface-600 dark:text-surface-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Analytics</h1>
        <p className="text-surface-600 dark:text-surface-400 mt-2">Platform activity and insights (Last 7 days)</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400 mb-1">Total Users Added</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{getTotalUsers()}</p>
            </div>
            <Users size={32} className="text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400 mb-1">Total Jobs Posted</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{getTotalJobs()}</p>
            </div>
            <Briefcase size={32} className="text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400 mb-1">Total Candidates</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{getTotalCandidates()}</p>
            </div>
            <FileText size={32} className="text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-6">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp size={20} />
          Activity Trend (Last 7 Days)
        </h2>

        <div className="space-y-4">
          {activityData.map((day) => (
            <div key={day.date} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* User Activity Bar */}
              <div className="flex items-center gap-2">
                <div className="w-12 text-xs text-surface-600 dark:text-surface-400">Users</div>
                <div className="flex-1 bg-surface-100 dark:bg-surface-700 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all"
                    style={{ width: `${(day.users / getMaxUsers()) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-medium text-surface-900 dark:text-white">{day.users}</span>
              </div>

              {/* Jobs Activity Bar */}
              <div className="flex items-center gap-2">
                <div className="w-12 text-xs text-surface-600 dark:text-surface-400">Jobs</div>
                <div className="flex-1 bg-surface-100 dark:bg-surface-700 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-green-500 h-full transition-all"
                    style={{ width: `${(day.jobs / getMaxUsers()) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-medium text-surface-900 dark:text-white">{day.jobs}</span>
              </div>

              {/* Candidates Activity Bar */}
              <div className="flex items-center gap-2">
                <div className="w-12 text-xs text-surface-600 dark:text-surface-400">Candidates</div>
                <div className="flex-1 bg-surface-100 dark:bg-surface-700 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full transition-all"
                    style={{ width: `${(day.candidates / getMaxUsers()) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-medium text-surface-900 dark:text-white">{day.candidates}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
