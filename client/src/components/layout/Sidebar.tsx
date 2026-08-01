import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Upload,
  Kanban,
  BarChart3,
  MessageSquare,
  Search,
  Settings,
  ChevronLeft,
  Sparkles,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', subtitle: 'Overview & key metrics', path: '/dashboard' },
  { icon: Users, label: 'Candidates', subtitle: 'Manage applicant profiles', path: '/candidates' },
  { icon: Briefcase, label: 'Jobs', subtitle: 'Open positions & postings', path: '/jobs' },
  { icon: Upload, label: 'Upload Resume', subtitle: 'Add new candidate resumes', path: '/upload' },
  { icon: Kanban, label: 'Pipeline', subtitle: 'Track hiring stages', path: '/pipeline' },
  { icon: Sparkles, label: 'AI Analysis', subtitle: 'AI-powered candidate insights', path: '/analysis' },
  { icon: CalendarDays, label: 'Calendar', subtitle: 'Schedule & manage events', path: '/calendar' },
  { icon: MessageSquare, label: 'Interviews', subtitle: 'Questions & prep tools', path: '/interviews' },
  { icon: BarChart3, label: 'Analytics', subtitle: 'Reports & hiring data', path: '/analytics' },
  { icon: Search, label: 'Search', subtitle: 'Find candidates fast', path: '/search' },
  { icon: Settings, label: 'Settings', subtitle: 'Account & preferences', path: '/settings' },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebarCollapse, sidebarOpen, toggleSidebar } = useAppStore();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 280 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-0 left-0 h-full z-50 flex flex-col',
          'bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl',
          'border-r border-surface-200/60 dark:border-surface-800/60',
          'lg:relative lg:z-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow">
            <Sparkles size={16} className="text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent"
              >
                HireFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => sidebarOpen && toggleSidebar()}
                className={cn(
                  'relative flex items-center gap-3 px-3 rounded-xl transition-all duration-200',
                  sidebarCollapsed ? 'py-2.5 justify-center' : 'py-2.5',
                  isActive
                    ? 'text-brand-700 dark:text-brand-300'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800/50'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-brand-50 dark:bg-brand-500/10 rounded-xl border border-brand-200/50 dark:border-brand-500/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <item.icon size={20} className="relative z-10 shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="relative z-10 min-w-0"
                    >
                      <span className="text-sm font-medium block leading-tight">
                        {item.label}
                      </span>
                      <span className="text-[11px] leading-tight text-surface-400 dark:text-surface-500 block truncate">
                        {item.subtitle}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="px-3 py-4 border-t border-surface-200/60 dark:border-surface-800/60 hidden lg:block">
          <button
            onClick={toggleSidebarCollapse}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-colors w-full"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronLeft size={18} />
            </motion.div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
