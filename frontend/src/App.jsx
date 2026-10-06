import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { KasumoLayout } from './components/layout/KasumoLayout';

// Dynamic lazy imports for route-based chunking
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const CareerGoalsPage = React.lazy(() => import('./pages/CareerGoalsPage').then(m => ({ default: m.CareerGoalsPage })));
const EvidencePage = React.lazy(() => import('./pages/EvidencePage').then(m => ({ default: m.EvidencePage })));
const VerificationPage = React.lazy(() => import('./pages/VerificationPage').then(m => ({ default: m.VerificationPage })));
const StudentOpportunitiesPage = React.lazy(() => import('./pages/student/StudentOpportunitiesPage').then(m => ({ default: m.StudentOpportunitiesPage })));
const OpportunityDiscoveryPage = React.lazy(() => import('./pages/student/OpportunityDiscoveryPage').then(m => ({ default: m.OpportunityDiscoveryPage })));
const StudentDiscoveryDetailPage = React.lazy(() => import('./pages/student/OpportunityDetailPage').then(m => ({ default: m.OpportunityDetailPage })));
const GapAnalysisPage = React.lazy(() => import('./pages/student/GapAnalysisPage').then(m => ({ default: m.GapAnalysisPage })));
const CareerIntelligencePage = React.lazy(() => import('./pages/student/CareerIntelligencePage').then(m => ({ default: m.CareerIntelligencePage })));
const StudentConnectionsPage = React.lazy(() => import('./pages/student/StudentConnectionsPage').then(m => ({ default: m.StudentConnectionsPage })));
const OpportunitiesPage = React.lazy(() => import('./pages/recruiter/OpportunitiesPage').then(m => ({ default: m.OpportunitiesPage })));
const CreateOpportunityPage = React.lazy(() => import('./pages/recruiter/CreateOpportunityPage').then(m => ({ default: m.CreateOpportunityPage })));
const OpportunityDetailPage = React.lazy(() => import('./pages/recruiter/OpportunityDetailPage').then(m => ({ default: m.OpportunityDetailPage })));
const RecruiterConnectionsPage = React.lazy(() => import('./pages/recruiter/RecruiterConnectionsPage').then(m => ({ default: m.RecruiterConnectionsPage })));
const AssessmentsListPage = React.lazy(() => import('./pages/student/AssessmentsListPage').then(m => ({ default: m.AssessmentsListPage })));
const AssessmentTakingPage = React.lazy(() => import('./pages/student/AssessmentTakingPage').then(m => ({ default: m.AssessmentTakingPage })));
const AssessmentResultPage = React.lazy(() => import('./pages/student/AssessmentResultPage').then(m => ({ default: m.AssessmentResultPage })));
const LeaderboardPage = React.lazy(() => import('./pages/common/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <div className="h-9 w-9 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
  </div>
);

export function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes without sidebar */}
            <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Common Dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <KasumoLayout>
                  <DashboardPage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />

          {/* Student-only routes */}
          <Route
            path="/student/discover"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <KasumoLayout>
                  <OpportunityDiscoveryPage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/discover/:id"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <KasumoLayout>
                  <StudentDiscoveryDetailPage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/intelligence"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <KasumoLayout>
                  <CareerIntelligencePage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/career-intelligence"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <KasumoLayout>
                  <CareerIntelligencePage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/gaps"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <KasumoLayout>
                  <GapAnalysisPage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/opportunities"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <KasumoLayout>
                  <StudentOpportunitiesPage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/connections"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <KasumoLayout>
                  <StudentConnectionsPage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <KasumoLayout>
                  <ProfilePage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/career-goals"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <KasumoLayout>
                  <CareerGoalsPage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/evidence"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <KasumoLayout>
                  <EvidencePage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />

          {/* Technical Assessments (Round-1 Screening Engine) */}
          <Route
            path="/student/assessments"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <KasumoLayout>
                  <AssessmentsListPage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/assessments/:assessmentId/attempts/:attemptId"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <KasumoLayout>
                  <AssessmentTakingPage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/assessments/attempts/:attemptId/result"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <KasumoLayout>
                  <AssessmentResultPage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />

          {/* Real-Data Capability Leaderboard */}
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <KasumoLayout>
                  <LeaderboardPage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />

          {/* Recruiter / Admin opportunity and connection management */}
          <Route
            path="/recruiter/opportunities"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                <KasumoLayout>
                  <OpportunitiesPage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/connections"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                <KasumoLayout>
                  <RecruiterConnectionsPage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/opportunities/new"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                <KasumoLayout>
                  <CreateOpportunityPage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/opportunities/:id"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                <KasumoLayout>
                  <OpportunityDetailPage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />

          {/* Recruiter / Admin verification queue */}
          <Route
            path="/recruiter/verifications"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                <KasumoLayout>
                  <VerificationPage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/verifications"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                <KasumoLayout>
                  <VerificationPage />
                </KasumoLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
