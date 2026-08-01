import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const variants = {
    default: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    danger: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-lg',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
