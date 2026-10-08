import { motion } from 'framer-motion';
import { Mail, User, Calendar } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export function PortalProfile() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Your Profile</h1>
        <p className="text-lg text-surface-600 dark:text-surface-400">Manage your candidate profile information</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8 space-y-6"
      >
        {/* Name */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
            <User size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-surface-500">Full Name</p>
            <p className="text-lg font-bold text-surface-900 dark:text-white">{user?.name}</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-4 pt-4 border-t border-surface-200 dark:border-surface-700">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Mail size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-surface-500">Email Address</p>
            <p className="text-lg font-bold text-surface-900 dark:text-white">{user?.email}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-4 pt-4 border-t border-surface-200 dark:border-surface-700">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Calendar size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-surface-500">Account Status</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">✓ Active</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6"
      >
        <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Profile Visibility</h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Your profile is visible to the admin team. They can see your information and contact you about opportunities.
        </p>
      </motion.div>
    </div>
  );
}

export default PortalProfile;
