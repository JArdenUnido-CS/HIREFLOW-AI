import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { sampleNotifications } from '@/data/sampleData';
import { formatRelativeTime, cn } from '@/lib/utils';

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const colorMap = {
  info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  error: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

export function NotificationPanel() {
  const { notificationOpen, setNotificationOpen } = useAppStore();

  return (
    <AnimatePresence>
      {notificationOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={() => setNotificationOpen(false)}
          />
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-white dark:bg-surface-900 border-l border-surface-200 dark:border-surface-800 shadow-glass-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-brand-600" />
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Notifications</h2>
                <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium">
                  {sampleNotifications.filter((n) => !n.read).length}
                </span>
              </div>
              <button
                onClick={() => setNotificationOpen(false)}
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                aria-label="Close notifications"
              >
                <X size={18} />
              </button>
            </div>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {sampleNotifications.map((notification, i) => {
                const Icon = iconMap[notification.type];
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm',
                      notification.read
                        ? 'bg-surface-50 dark:bg-surface-800/30 border-surface-200 dark:border-surface-700/30'
                        : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 shadow-sm'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', colorMap[notification.type])}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            'text-sm',
                            notification.read
                              ? 'text-surface-600 dark:text-surface-400'
                              : 'font-medium text-surface-800 dark:text-surface-200'
                          )}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-surface-400 mt-1.5">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-surface-200 dark:border-surface-800">
              <button className="text-sm text-brand-600 hover:text-brand-700 font-medium w-full text-center">
                Mark all as read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
