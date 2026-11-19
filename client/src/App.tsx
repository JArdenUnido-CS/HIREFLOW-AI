import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { EmployerLayout } from '@/components/layout/EmployerLayout';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

// Admin routes
const AdminDashboard = lazy(() => import('@/features/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminUsers = lazy(() => import('@/features/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminActivity = lazy(() => import('@/features/admin/AdminActivity').then(m => ({ default: m.AdminActivity })));
const AdminAnalytics = lazy(() => import('@/features/admin/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })));
const AdminSettings = lazy(() => import('@/features/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));

// Employer/Recruiter routes (reuse existing recruitment pages)
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CandidatesPage = lazy(() => import('@/features/candidates/CandidatesPage').then(m => ({ default: m.CandidatesPage })));
const CandidateDetailPage = lazy(() => import('@/features/candidates/CandidateDetailPage').then(m => ({ default: m.CandidateDetailPage })));
const UploadPage = lazy(() => import('@/features/candidates/UploadPage').then(m => ({ default: m.UploadPage })));
const JobsPage = lazy(() => import('@/features/jobs/JobsPage').then(m => ({ default: m.JobsPage })));
const PipelinePage = lazy(() => import('@/features/pipeline/PipelinePage').then(m => ({ default: m.PipelinePage })));
const AnalysisPage = lazy(() => import('@/features/analysis/AnalysisPage').then(m => ({ default: m.AnalysisPage })));
const InterviewsPage = lazy(() => import('@/features/interviews/InterviewsPage').then(m => ({ default: m.InterviewsPage })));
const AnalyticsPage = lazy(() => import('@/features/analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const CalendarPage = lazy(() => import('@/features/calendar/CalendarPage').then(m => ({ default: m.CalendarPage })));
const SearchPage = lazy(() => import('@/features/search/SearchPage').then(m => ({ default: m.SearchPage })));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Client/Applicant routes (reuse existing portal pages)
const PortalDashboard = lazy(() => import('@/features/portal/PortalDashboard').then(m => ({ default: m.PortalDashboard })));
const PortalApplications = lazy(() => import('@/features/portal/PortalApplications').then(m => ({ default: m.PortalApplications })));
const PortalProfile = lazy(() => import('@/features/portal/PortalProfile').then(m => ({ default: m.PortalProfile })));
const PortalUpload = lazy(() => import('@/features/portal/PortalUpload').then(m => ({ default: m.PortalUpload })));
const CVBuilder = lazy(() => import('@/features/cv/CVBuilder').then(m => ({ default: m.CVBuilder })));

// Client job browsing routes
const JobSearchPage = lazy(() => import('@/features/client/JobSearchPage').then(m => ({ default: m.JobSearchPage })));
const JobDetailPage = lazy(() => import('@/features/client/JobDetailPage').then(m => ({ default: m.JobDetailPage })));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRedirect() {
  const { user } = useAuthStore();
  
  // Debug logging
  console.log('RoleRedirect - Current user:', user);
  
  if (!user) return <Navigate to="/login" replace />;
  
  // Redirect based on role
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'employer') return <Navigate to="/employer/dashboard" replace />;
  if (user.role === 'client') return <Navigate to="/client/dashboard" replace />;
  
  // Default fallback
  console.warn('Unknown role:', user.role);
  return <Navigate to="/login" replace />;
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

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['admin']}>
                <AdminLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Suspense fallback={<DashboardSkeleton />}><AdminDashboard /></Suspense>} />
          <Route path="users" element={<Suspense fallback={<DashboardSkeleton />}><AdminUsers /></Suspense>} />
          <Route path="activity" element={<Suspense fallback={<DashboardSkeleton />}><AdminActivity /></Suspense>} />
          <Route path="analytics" element={<Suspense fallback={<DashboardSkeleton />}><AdminAnalytics /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<DashboardSkeleton />}><AdminSettings /></Suspense>} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* EMPLOYER ROUTES */}
        <Route
          path="/employer"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['employer']}>
                <EmployerLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Suspense fallback={<DashboardSkeleton />}><DashboardPage /></Suspense>} />
          <Route path="candidates" element={<Suspense fallback={<DashboardSkeleton />}><CandidatesPage /></Suspense>} />
          <Route path="candidates/:candidateId" element={<Suspense fallback={<DashboardSkeleton />}><CandidateDetailPage /></Suspense>} />
          <Route path="upload" element={<Suspense fallback={<DashboardSkeleton />}><UploadPage /></Suspense>} />
          <Route path="jobs" element={<Suspense fallback={<DashboardSkeleton />}><JobsPage /></Suspense>} />
          <Route path="pipeline" element={<Suspense fallback={<DashboardSkeleton />}><PipelinePage /></Suspense>} />
          <Route path="analysis" element={<Suspense fallback={<DashboardSkeleton />}><AnalysisPage /></Suspense>} />
          <Route path="calendar" element={<Suspense fallback={<DashboardSkeleton />}><CalendarPage /></Suspense>} />
          <Route path="interviews" element={<Suspense fallback={<DashboardSkeleton />}><InterviewsPage /></Suspense>} />
          <Route path="analytics" element={<Suspense fallback={<DashboardSkeleton />}><AnalyticsPage /></Suspense>} />
          <Route path="search" element={<Suspense fallback={<DashboardSkeleton />}><SearchPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<DashboardSkeleton />}><SettingsPage /></Suspense>} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* CLIENT ROUTES */}
        <Route
          path="/client"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['client']}>
                <ClientLayout />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Suspense fallback={<DashboardSkeleton />}><PortalDashboard /></Suspense>} />
          <Route path="applications" element={<Suspense fallback={<DashboardSkeleton />}><PortalApplications /></Suspense>} />
          <Route path="resume" element={<Suspense fallback={<DashboardSkeleton />}><PortalUpload /></Suspense>} />
          <Route path="profile" element={<Suspense fallback={<DashboardSkeleton />}><PortalProfile /></Suspense>} />
          <Route path="cv" element={<Suspense fallback={<DashboardSkeleton />}><CVBuilder /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<DashboardSkeleton />}><SettingsPage /></Suspense>} />
          {/* Job browsing routes */}
          <Route path="jobs" element={<Suspense fallback={<DashboardSkeleton />}><JobSearchPage /></Suspense>} />
          <Route path="jobs/:jobId" element={<Suspense fallback={<DashboardSkeleton />}><JobDetailPage /></Suspense>} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
