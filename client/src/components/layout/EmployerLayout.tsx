import { Outlet } from 'react-router-dom';
import { AppLayout } from './AppLayout';

/**
 * EmployerLayout - Uses the existing AppLayout since employers use the recruitment dashboard
 */
export function EmployerLayout() {
  return <AppLayout />;
}
