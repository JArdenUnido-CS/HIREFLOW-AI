import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  Settings, 
  LogOut,
  X,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const { logout } = useAuthStore();

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: 'Users', icon: Users, href: '/admin/users' },
    { label: 'System Activity', icon: Activity, href: '/admin/activity' },
    { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
    { label: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800
        transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-6 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
          <h1 className="text-lg font-bold text-surface-900 dark:text-white">HireFlow Admin</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg"
          >
            <X size={20} className="text-surface-600 dark:text-surface-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive(item.href)
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                  : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                }
              `}
            >
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-surface-200 dark:border-surface-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-surface-700 dark:text-surface-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
