import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, Moon, Search, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';

export function Navbar() {
  const { resolvedTheme, setTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { toggleSidebar, setSearchOpen, setNotificationOpen } = useAppStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-surface-200/60 dark:border-surface-800/60 bg-white/60 dark:bg-surface-950/60 backdrop-blur-xl sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Center - Search */}
      <button
        onClick={() => setSearchOpen(true)}
        className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-400 text-sm hover:border-surface-300 dark:hover:border-surface-600 transition-colors min-w-[260px]"
      >
        <Search size={16} />
        <span>Search candidates, jobs...</span>
        <kbd className="ml-auto text-xs bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded font-mono">
          /
        </kbd>
      </button>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"
          aria-label="Toggle theme"
        >
          <motion.div
            key={resolvedTheme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </motion.div>
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setNotificationOpen(true)}
          className="relative p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-surface-950" />
        </motion.button>

        {/* User */}
        {user && (
          <div className="relative flex items-center gap-3 ml-2 pl-3 border-l border-surface-200 dark:border-surface-700">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{user.name}</p>
                <p className="text-xs text-surface-500">{user.role}</p>
              </div>
              <Avatar name={user.name} size="sm" />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 z-50 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 shadow-glass-lg overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-800">
                      <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{user.name}</p>
                      <p className="text-xs text-surface-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
