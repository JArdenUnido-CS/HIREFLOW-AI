import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  createdAt: string;
}

type SortField = 'name' | 'email' | 'role' | 'department' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUsers(token);
    } else {
      setLoading(false);
      toast.error('No authentication token found');
    }
  }, []);

  const fetchUsers = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-surface-600 dark:text-surface-400">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">User Management</h1>
        <p className="text-surface-600 dark:text-surface-400 mt-2">Manage system users and their roles</p>
      </div>

      <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden">
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
