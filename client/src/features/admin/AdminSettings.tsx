import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Database } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'database', label: 'Database', icon: Database },
];

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Settings</h1>
        <p className="text-surface-500 mt-1">System configuration and admin preferences</p>
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
          {activeTab === 'general' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Platform Configuration</h3>
                <div className="space-y-4">
                  <Input label="Platform Name" defaultValue="HireFlow AI" id="platform-name" />
                  <Input label="Support Email" defaultValue="support@hireflow.ai" id="support-email" type="email" />
                  <Input label="Max Job Postings per Employer" defaultValue="50" id="max-jobs" type="number" />
                  <Button variant="primary" loading={loading}>Save Configuration</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Notification Settings</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Alert on new user registrations', id: 'notify-users' },
                    { label: 'Alert on new job postings', id: 'notify-jobs' },
                    { label: 'Alert on suspicious activity', id: 'notify-suspicious' },
                    { label: 'Daily platform summary', id: 'notify-daily' },
                    { label: 'Weekly analytics report', id: 'notify-weekly' },
                  ].map((item) => (
                    <label key={item.id} className="flex items-center justify-between py-2">
                      <span className="text-sm text-surface-700 dark:text-surface-300">{item.label}</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500" />
                    </label>
                  ))}
                  <Button variant="primary" loading={loading}>Save Preferences</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Security Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between py-2">
                    <span className="text-sm text-surface-700 dark:text-surface-300">Require 2FA for admins</span>
                    <input type="checkbox" className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500" />
                  </label>
                  <label className="flex items-center justify-between py-2">
                    <span className="text-sm text-surface-700 dark:text-surface-300">Enable IP whitelisting</span>
                    <input type="checkbox" className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500" />
                  </label>
                  <label className="flex items-center justify-between py-2">
                    <span className="text-sm text-surface-700 dark:text-surface-300">Log all admin actions</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500" />
                  </label>
                  <Button variant="primary" loading={loading}>Save Security Settings</Button>
                </div>
              </Card>

              <Card padding="lg">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">Sessions</h3>
                <p className="text-sm text-surface-500 mb-4">Active admin sessions</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-700">
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">Current Session</p>
                      <p className="text-xs text-surface-400">Active now</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-medium rounded">Active</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'database' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Database Management</h3>
                <div className="space-y-3">
                  <Button 
                    variant="primary"
                    loading={loading}
                    onClick={() => {
                      setLoading(true);
                      setTimeout(() => {
                        toast.success('Database backup created successfully');
                        setLoading(false);
                      }, 1000);
                    }}
                  >
                    Create Backup
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => toast('Last backup: 2 hours ago')}
                  >
                    View Backups
                  </Button>
                </div>
              </Card>

              <Card padding="lg">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Database Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-600 dark:text-surface-400">Database Size</span>
                    <span className="font-medium text-surface-900 dark:text-white">42.5 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600 dark:text-surface-400">Active Connections</span>
                    <span className="font-medium text-surface-900 dark:text-white">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-600 dark:text-surface-400">Query Cache</span>
                    <span className="font-medium text-surface-900 dark:text-white">8.2 MB</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
