import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Briefcase, FileText, Activity, TrendingUp, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

interface SystemStats {
  totalUsers: number;
  totalEmployers: number;
  totalClients: number;
  totalJobs: number;
  totalCandidates: number;
  activeJobs: number;
  usersThisWeek: number;
  jobsThisWeek: number;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  createdAt: string;
}

interface ActivityData {
  date: string;
  users: number;
  jobs: number;
  candidates: number;
}

type SortField = 'name' | 'email' | 'role' | 'department' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    console.log('AdminDashboard mounted. Token:', token ? 'present' : 'missing');
    
    if (token) {
      fetchAdminData(token);
    } else {
      setLoading(false);
      setError('No authentication token found');
    }
  }, []);

  const fetchAdminData = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching admin data with token:', token.substring(0, 20) + '...');

      // Fetch system stats
      console.log('Fetching system stats...');
      const statsRes = await fetch('http://localhost:3001/api/admin/system-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Stats response status:', statsRes.status);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log('Stats data:', statsData);
        setStats(statsData);
      } else {
        const errorText = await statsRes.text();
        console.error('Stats API error:', statsRes.status, errorText);
        throw new Error(`Stats API error: ${statsRes.status}`);
      }

      // Fetch users
      console.log('Fetching users...');
      const usersRes = await fetch('http://localhost:3001/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Users response status:', usersRes.status);
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        console.log('Users data count:', usersData.length);
        setUsers(usersData);
      } else {
        const errorText = await usersRes.text();
        console.error('Users API error:', usersRes.status, errorText);
        throw new Error(`Users API error: ${usersRes.status}`);
      }

      // Fetch activity data
      console.log('Fetching activity data...');
      const activityRes = await fetch('http://localhost:3001/api/admin/activity-summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Activity response status:', activityRes.status);
      
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        console.log('Activity data count:', activityData.length);
        setActivityData(activityData);
      } else {
        const errorText = await activityRes.text();
        console.error('Activity API error:', activityRes.status, errorText);
        throw new Error(`Activity API error: ${activityRes.status}`);
      }

      console.log('All admin data loaded successfully');
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      toast.error('Failed to load admin dashboard: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-surface-600 dark:text-surface-400">Loading system data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Error Loading Dashboard</p>
          <p className="text-surface-600 dark:text-surface-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    // Handle null/undefined
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return sortDirection === 'asc' ? 1 : -1;
    if (bVal == null) return sortDirection === 'asc' ? -1 : 1;

    // Handle dates
    if (sortField === 'createdAt') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    } else {
      aVal = (aVal || '').toString().toLowerCase();
      bVal = (bVal || '').toString().toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="opacity-0 group-hover:opacity-30 transition-opacity">⇅</span>;
    return sortDirection === 'asc' ? (
      <ChevronUp size={16} className="text-blue-500" />
    ) : (
      <ChevronDown size={16} className="text-blue-500" />
    );
  };

  const roleColors = {
    admin: '#ef4444',
    employer: '#3b82f6',
    client: '#10b981'
  };

  const usersByRole = stats ? [
    { name: 'Admins', value: 1, fill: roleColors.admin },
    { name: 'Employers', value: stats.totalEmployers, fill: roleColors.employer },
    { name: 'Clients', value: stats.totalClients, fill: roleColors.client }
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">System Administration</h1>
        <p className="text-surface-600 dark:text-surface-400 mt-2">Monitor platform activity and manage users</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-surface-800 rounded-lg p-6 border border-surface-200 dark:border-surface-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400">Total Users</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white mt-2">{stats?.totalUsers || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-lg p-6 border border-surface-200 dark:border-surface-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400">Employers</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white mt-2">{stats?.totalEmployers || 0}</p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-lg p-6 border border-surface-200 dark:border-surface-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400">Applicants (Clients)</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white mt-2">{stats?.totalClients || 0}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-lg p-6 border border-surface-200 dark:border-surface-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400">Active Jobs</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white mt-2">{stats?.activeJobs || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-lg p-6 border border-surface-200 dark:border-surface-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400">Total Candidates</p>
              <p className="text-2xl font-bold text-surface-900 dark:text-white mt-2">{stats?.totalCandidates || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white dark:bg-surface-800 rounded-lg p-6 border border-surface-200 dark:border-surface-700">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Platform Activity (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
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

        {/* User Distribution */}
        <div className="bg-white dark:bg-surface-800 rounded-lg p-6 border border-surface-200 dark:border-surface-700">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Users by Role</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={usersByRole}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {usersByRole.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
        <div className="p-6 border-b border-surface-200 dark:border-surface-700">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">Registered Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700">
              <tr>
                <th 
                  onClick={() => handleSort('name')}
                  className="group px-6 py-3 text-left text-xs font-medium text-surface-700 dark:text-surface-300 uppercase tracking-wider cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Name
                    <SortIcon field="name" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('email')}
                  className="group px-6 py-3 text-left text-xs font-medium text-surface-700 dark:text-surface-300 uppercase tracking-wider cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Email
                    <SortIcon field="email" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('role')}
                  className="group px-6 py-3 text-left text-xs font-medium text-surface-700 dark:text-surface-300 uppercase tracking-wider cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Role
                    <SortIcon field="role" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('department')}
                  className="group px-6 py-3 text-left text-xs font-medium text-surface-700 dark:text-surface-300 uppercase tracking-wider cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Department
                    <SortIcon field="department" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('createdAt')}
                  className="group px-6 py-3 text-left text-xs font-medium text-surface-700 dark:text-surface-300 uppercase tracking-wider cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Joined
                    <SortIcon field="createdAt" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {sortedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-surface-50 dark:hover:bg-surface-700/50">
                  <td className="px-6 py-4 text-sm font-medium text-surface-900 dark:text-white">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{u.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      u.role === 'employer' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">{u.department || '—'}</td>
                  <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
