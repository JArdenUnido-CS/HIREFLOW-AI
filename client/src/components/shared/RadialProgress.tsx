import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { cn, getScoreColor } from '@/lib/utils';

interface RadialProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function RadialProgress({
  value,
  size = 80,
  strokeWidth = 6,
  label,
  showValue = true,
  className,
}: RadialProgressProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true });

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-1.5', className)}>
      <svg ref={ref} width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-100 dark:text-surface-800"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={isInView ? { strokeDashoffset: offset } : {}}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4c6ef5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      {showValue && (
        <span className={cn('text-sm font-bold absolute', getScoreColor(value))}>
          {/* Overlay the value in the center */}
        </span>
      )}
      <div className="text-center">
        {showValue && (
          <p className={cn('text-lg font-bold', getScoreColor(value))}>{value}%</p>
        )}
        {label && (
          <p className="text-xs text-surface-500 dark:text-surface-400">{label}</p>
        )}
      </div>
    </div>
  );
}
