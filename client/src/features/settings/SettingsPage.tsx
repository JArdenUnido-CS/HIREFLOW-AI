import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Palette, Bell, Shield, Key, Monitor, Moon, Sun } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageTransition } from '@/components/shared/PageTransition';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, setTheme } = useThemeStore();
  const { user } = useAuthStore();

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Settings</h1>
          <p className="text-surface-500 mt-1">Manage your account preferences</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar tabs */}
          <nav className="sm:w-56 shrink-0">
            <div className="flex sm:flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left',
                    activeTab === tab.id
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                  )}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Profile Information</h3>
                  <div className="space-y-4">
                    <Input label="Full Name" defaultValue={user?.name} id="name" />
                    <Input label="Email" type="email" defaultValue={user?.email} id="email" />
                    <Input label="Department" defaultValue={user?.department} id="department" />
                    <Button variant="primary">Save Changes</Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Theme</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Monitor },
                    ] as const).map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setTheme(option.id)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                          theme === option.id
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                            : 'border-surface-200 dark:border-surface-700 hover:border-surface-300'
                        )}
                      >
                        <option.icon size={24} className={theme === option.id ? 'text-brand-600' : 'text-surface-400'} />
                        <span className={cn('text-sm font-medium', theme === option.id ? 'text-brand-700 dark:text-brand-300' : 'text-surface-600 dark:text-surface-400')}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Notification Preferences</h3>
                  <div className="space-y-4">
                    {['New applications', 'Interview reminders', 'Candidate stage changes', 'Weekly digest'].map((item) => (
                      <label key={item} className="flex items-center justify-between py-2">
                        <span className="text-sm text-surface-700 dark:text-surface-300">{item}</span>
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500" />
                      </label>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Change Password</h3>
                  <div className="space-y-4">
                    <Input label="Current Password" type="password" id="current-pw" />
                    <Input label="New Password" type="password" id="new-pw" />
                    <Input label="Confirm Password" type="password" id="confirm-pw" />
                    <Button variant="primary">Update Password</Button>
                  </div>
                </Card>
                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">Active Sessions</h3>
                  <p className="text-sm text-surface-500 mb-4">Manage your active sessions across devices</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
                      <div>
                        <p className="text-sm font-medium text-surface-800 dark:text-surface-200">MacBook Pro - Chrome</p>
                        <p className="text-xs text-surface-400">San Francisco, CA · Active now</p>
                      </div>
                      <Badge variant="success">Current</Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
