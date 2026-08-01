import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-500';
  if (score >= 70) return 'text-brand-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

export function getScoreBgColor(score: number): string {
  if (score >= 85) return 'bg-emerald-500';
  if (score >= 70) return 'bg-brand-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

export function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    applied: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    screening: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    shortlisted: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    interview: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    technical_test: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    hr_interview: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    offer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    hired: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };
  return colors[stage] || colors.applied;
}

export function formatSalary(min: number, max: number): string {
  const format = (n: number) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
    return `$${n}`;
  };
  return `${format(min)} - ${format(max)}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
