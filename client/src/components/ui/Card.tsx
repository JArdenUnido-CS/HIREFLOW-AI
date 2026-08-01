import { type HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ className, hover = false, glass = false, padding = 'md', children, ...props }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)' } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-2xl transition-all duration-200',
        glass
          ? 'glass-card'
          : 'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700/50 shadow-card',
        paddings[padding],
        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}
