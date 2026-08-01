import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Briefcase, User, Settings, Sparkles, LogOut, Menu, Moon, Sun, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { GradientOrbs } from '@/components/shared/GradientOrbs';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/portal' },
  { icon: Briefcase, label: 'Applications', path: '/portal/applications' },
  { icon: FileText, label: 'My Resume', path: '/portal/resume' },
  { icon: User, label: 'My Profile', path: '/portal/profile' },
  { icon: Settings, label: 'Settings', path: '/portal/settings' },
];

export function CandidateLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-50 dark:bg-surface-950 transition-theme">
      <GradientOrbs />

      {/* Top navbar */}
      <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-surface-200/60 dark:border-surface-800/60 bg-white/70 dark:bg-surface-950/70 backdrop-blur-xl sticky top-0 z-30">
        {/* Left - Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent hidden sm:block">
              HireFlow
            </span>
          </div>
        </div>

        {/* Center - Nav (desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'text-brand-700 dark:text-brand-300'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800/50'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="portal-nav-active"
                    className="absolute inset-0 bg-brand-50 dark:bg-brand-500/10 rounded-xl border border-brand-200/50 dark:border-brand-500/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <item.icon size={16} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {user && (
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-surface-200 dark:border-surface-700">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{user.name}</p>
                <p className="text-xs text-surface-500">Candidate</p>
              </div>
              <Avatar name={user.name} size="sm" />
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-72 z-50 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 p-4 lg:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
                    <Sparkles size={15} className="text-white" />
                  </div>
                  <span className="font-bold bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">HireFlow</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800">
                  <X size={18} />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      location.pathname === item.path
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                    )}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
