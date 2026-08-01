import { motion } from 'framer-motion';
import { cn, getScoreColor, getScoreBgColor } from '@/lib/utils';

interface ScoreCardProps {
  label: string;
  score: number;
  icon?: React.ReactNode;
  delay?: number;
}

export function ScoreCard({ label, score, icon, delay = 0 }: ScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700/50 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wide">
          {label}
        </span>
        {icon && <span className="text-surface-400">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className={cn('text-2xl font-bold', getScoreColor(score))}>{score}</span>
        <span className="text-sm text-surface-400 mb-0.5">/100</span>
      </div>
      {/* Progress bar */}
      <div className="mt-3 h-1.5 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: delay + 0.3, ease: 'easeOut' }}
          className={cn('h-full rounded-full', getScoreBgColor(score))}
        />
      </div>
    </motion.div>
  );
}
