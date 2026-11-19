import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

/**
 * RoleGuard - Protects routes by role
 * If user doesn't have the required role, redirects to appropriate dashboard based on their role
 */
export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'employer') return <Navigate to="/employer/dashboard" replace />;
    if (user.role === 'client') return <Navigate to="/client/dashboard" replace />;
    
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
