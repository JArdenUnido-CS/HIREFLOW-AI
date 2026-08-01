import { UserPlus, ArrowRight, Calendar, Send, StickyNote, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatRelativeTime } from '@/lib/utils';
import type { Activity } from '@/types';

const activityIcons: Record<string, React.ReactNode> = {
  candidate_added: <UserPlus size={14} />,
  stage_changed: <ArrowRight size={14} />,
  interview_scheduled: <Calendar size={14} />,
  offer_sent: <Send size={14} />,
  note_added: <StickyNote size={14} />,
  job_created: <Briefcase size={14} />,
};

const activityColors: Record<string, string> = {
  candidate_added: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  stage_changed: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  interview_scheduled: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  offer_sent: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  note_added: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  job_created: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
};

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
          Recent Activity
        </h3>
        <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">
          View all
        </button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activityColors[activity.type]}`}>
              {activityIcons[activity.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-surface-700 dark:text-surface-300">
                {activity.description}
              </p>
              <p className="text-xs text-surface-400 mt-0.5">
                {activity.userName} · {formatRelativeTime(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
