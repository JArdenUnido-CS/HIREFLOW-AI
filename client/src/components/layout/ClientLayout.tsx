import { Outlet } from 'react-router-dom';
import { CandidateLayout } from './CandidateLayout';

/**
 * ClientLayout - Uses the existing CandidateLayout since clients are job seekers
 */
export function ClientLayout() {
  return <CandidateLayout />;
}
