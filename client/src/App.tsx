import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { CandidateLayout } from '@/components/layout/CandidateLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

// Lazy-loaded admin/recruiter routes
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CandidatesPage = lazy(() => import('@/features/candidates/CandidatesPage').then(m => ({ default: m.CandidatesPage })));
const UploadPage = lazy(() => import('@/features/candidates/UploadPage').then(m => ({ default: m.UploadPage })));
const JobsPage = lazy(() => import('@/features/jobs/JobsPage').then(m => ({ default: m.JobsPage })));
const PipelinePage = lazy(() => import('@/features/pipeline/PipelinePage').then(m => ({ default: m.PipelinePage })));
const AnalysisPage = lazy(() => import('@/features/analysis/AnalysisPage').then(m => ({ default: m.AnalysisPage })));
const InterviewsPage = lazy(() => import('@/features/interviews/InterviewsPage').then(m => ({ default: m.InterviewsPage })));
const AnalyticsPage = lazy(() => import('@/features/analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const CalendarPage = lazy(() => import('@/features/calendar/CalendarPage').then(m => ({ default: m.CalendarPage })));
const SearchPage = lazy(() => import('@/features/search/SearchPage').then(m => ({ default: m.SearchPage })));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Lazy-loaded candidate portal routes
const PortalDashboard = lazy(() => import('@/features/portal/PortalDashboard').then(m => ({ default: m.PortalDashboard })));
const PortalApplications = lazy(() => import('@/features/portal/PortalApplications').then(m => ({ default: m.PortalApplications })));
const PortalProfile = lazy(() => import('@/features/portal/PortalProfile').then(m => ({ default: m.PortalProfile })));
const PortalUpload = lazy(() => import('@/features/portal/PortalUpload').then(m => ({ default: m.PortalUpload })));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRedirect() {
  const { user } = useAuthStore();
  if (user?.role === 'candidate') return <Navigate to="/portal" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  // Initialize theme on mount
  useThemeStore();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm font-medium',
          style: {
            borderRadius: '12px',
            background: 'var(--glass-bg)',
            color: 'rgb(var(--color-text-primary))',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Role-based redirect */}
        <Route path="/" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

        {/* Admin/Recruiter routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Suspense fallback={<DashboardSkeleton />}><DashboardPage /></Suspense>} />
          <Route path="candidates" element={<Suspense fallback={<DashboardSkeleton />}><CandidatesPage /></Suspense>} />
          <Route path="upload" element={<Suspense fallback={<DashboardSkeleton />}><UploadPage /></Suspense>} />
          <Route path="jobs" element={<Suspense fallback={<DashboardSkeleton />}><JobsPage /></Suspense>} />
          <Route path="pipeline" element={<Suspense fallback={<DashboardSkeleton />}><PipelinePage /></Suspense>} />
          <Route path="analysis" element={<Suspense fallback={<DashboardSkeleton />}><AnalysisPage /></Suspense>} />
          <Route path="calendar" element={<Suspense fallback={<DashboardSkeleton />}><CalendarPage /></Suspense>} />
          <Route path="interviews" element={<Suspense fallback={<DashboardSkeleton />}><InterviewsPage /></Suspense>} />
          <Route path="analytics" element={<Suspense fallback={<DashboardSkeleton />}><AnalyticsPage /></Suspense>} />
          <Route path="search" element={<Suspense fallback={<DashboardSkeleton />}><SearchPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<DashboardSkeleton />}><SettingsPage /></Suspense>} />
        </Route>

        {/* Candidate portal routes */}
        <Route
          path="/portal"
          element={
            <ProtectedRoute>
              <CandidateLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Suspense fallback={<DashboardSkeleton />}><PortalDashboard /></Suspense>} />
          <Route path="applications" element={<Suspense fallback={<DashboardSkeleton />}><PortalApplications /></Suspense>} />
          <Route path="resume" element={<Suspense fallback={<DashboardSkeleton />}><PortalUpload /></Suspense>} />
          <Route path="profile" element={<Suspense fallback={<DashboardSkeleton />}><PortalProfile /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<DashboardSkeleton />}><SettingsPage /></Suspense>} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
