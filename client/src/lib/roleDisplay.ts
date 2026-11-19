/**
 * Role Display Mapping
 * Consistent human-readable role names across the application
 */

export type UserRole = 'admin' | 'employer' | 'client';

/**
 * Map internal role names to human-readable display names
 * Supports special cases for specific users
 */
export function getRoleDisplayName(role: UserRole, userName?: string): string {
  // Special case: Jem Arden Unido displays as "CEO"
  if (role === 'admin' && userName === 'Jem Arden Unido') {
    return 'CEO';
  }

  const roleMap: Record<UserRole, string> = {
    admin: 'System Administrator',
    employer: 'Employer',
    client: 'Job Seeker',
  };

  return roleMap[role] || role;
}

/**
 * Get role-specific short form for compact displays
 */
export function getRoleShortName(role: UserRole): string {
  const roleMap: Record<UserRole, string> = {
    admin: 'Admin',
    employer: 'Employer',
    client: 'Job Seeker',
  };

  return roleMap[role] || role;
}

/**
 * Get role color for visual differentiation
 */
export function getRoleColor(role: UserRole): string {
  const colorMap: Record<UserRole, string> = {
    admin: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
    employer: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
    client: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
  };

  return colorMap[role] || '';
}
