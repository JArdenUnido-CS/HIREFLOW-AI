import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

interface ActivityData {
  date: string;
  users: number;
  jobs: number;
  candidates: number;
}

export function AdminActivity() {
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchActivityData(token);
    } else {
      setLoading(false);
      toast.error('No authentication token found');
    }
  }, []);

  const fetchActivityData = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/admin/activity-summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setData(await res.json());
      } else {
        toast.error('Failed to load activity data');
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error);
      toast.error('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-surface-600 dark:text-surface-400">Loading activity data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">System Activity</h1>
        <p className="text-surface-600 dark:text-surface-400 mt-2">Platform activity over the last 7 days</p>
      </div>

      <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-6">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Platform Activity (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis dataKey="date" stroke="rgba(148,163,184,0.5)" />
            <YAxis stroke="rgba(148,163,184,0.5)" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="New Users" />
            <Line type="monotone" dataKey="jobs" stroke="#f59e0b" strokeWidth={2} name="New Jobs" />
            <Line type="monotone" dataKey="candidates" stroke="#10b981" strokeWidth={2} name="New Candidates" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
