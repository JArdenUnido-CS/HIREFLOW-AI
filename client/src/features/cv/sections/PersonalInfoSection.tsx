import { User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import type { ParsedCV } from '../CVBuilder';

interface PersonalInfoSectionProps {
  cv: ParsedCV;
  setCV: (cv: ParsedCV) => void;
}

export function PersonalInfoSection({ cv, setCV }: PersonalInfoSectionProps) {
  const { user } = useAuthStore();

  return (
    <div className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-surface-900 dark:text-white">Personal Information</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={user?.name || ''}
              disabled
              className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-white disabled:opacity-50"
            />
            <p className="text-xs text-surface-500 mt-1">From your account profile</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-surface-50 dark:bg-surface-700 text-surface-900 dark:text-white disabled:opacity-50"
            />
            <p className="text-xs text-surface-500 mt-1">From your account profile</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Location (Optional)
            </label>
            <input
              type="text"
              placeholder="City, Country"
              className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              LinkedIn (Optional)
            </label>
            <input
              type="url"
              placeholder="linkedin.com/in/yourname"
              className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              GitHub (Optional)
            </label>
            <input
              type="url"
              placeholder="github.com/yourname"
              className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Portfolio (Optional)
            </label>
            <input
              type="url"
              placeholder="yourwebsite.com"
              className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
