import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { KasumoLayout } from './components/layout/KasumoLayout';
import { ServerWakeupBanner } from './components/common/ServerWakeupBanner';

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
const RecruiterCandidatesPage = React.lazy(() => import('./pages/recruiter/RecruiterCandidatesPage').then(m => ({ default: m.RecruiterCandidatesPage })));
const RecruiterTalentSearchPage = React.lazy(() => import('./pages/recruiter/RecruiterTalentSearchPage').then(m => ({ default: m.RecruiterTalentSearchPage })));
const RecruiterShortlistPage = React.lazy(() => import('./pages/recruiter/RecruiterShortlistPage').then(m => ({ default: m.RecruiterShortlistPage })));
const RecruiterApplicationsPage = React.lazy(() => import('./pages/recruiter/RecruiterApplicationsPage').then(m => ({ default: m.RecruiterApplicationsPage })));
const RecruiterMessagesPage = React.lazy(() => import('./pages/recruiter/RecruiterMessagesPage').then(m => ({ default: m.RecruiterMessagesPage })));
const RecruiterAssessmentsPage = React.lazy(() => import('./pages/recruiter/RecruiterAssessmentsPage').then(m => ({ default: m.RecruiterAssessmentsPage })));
const RecruiterAnalyticsPage = React.lazy(() => import('./pages/recruiter/RecruiterAnalyticsPage').then(m => ({ default: m.RecruiterAnalyticsPage })));
const RecruiterOrganizationPage = React.lazy(() => import('./pages/recruiter/RecruiterOrganizationPage').then(m => ({ default: m.RecruiterOrganizationPage })));
const RecruiterSettingsPage = React.lazy(() => import('./pages/recruiter/RecruiterSettingsPage').then(m => ({ default: m.RecruiterSettingsPage })));
const StudentSettingsPage = React.lazy(() => import('./pages/student/StudentSettingsPage').then(m => ({ default: m.StudentSettingsPage })));
const RecruiterHelpPage = React.lazy(() => import('./pages/recruiter/RecruiterHelpPage').then(m => ({ default: m.RecruiterHelpPage })));
const AssessmentsListPage = React.lazy(() => import('./pages/student/AssessmentsListPage').then(m => ({ default: m.AssessmentsListPage })));
const AssessmentTakingPage = React.lazy(() => import('./pages/student/AssessmentTakingPage').then(m => ({ default: m.AssessmentTakingPage })));
const AssessmentResultPage = React.lazy(() => import('./pages/student/AssessmentResultPage').then(m => ({ default: m.AssessmentResultPage })));
const LeaderboardPage = React.lazy(() => import('./pages/common/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
  </div>
);

export function App() {
  return (
    <Router>
      <ThemeProvider>
        <ServerWakeupBanner />
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes without layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Layout Route */}
            <Route
              element={
                <ProtectedRoute>
                  <KasumoLayout />
                </ProtectedRoute>
              }
            >
              {/* Shared Protected Routes */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />

              {/* Student Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                <Route path="/student/discover" element={<OpportunityDiscoveryPage />} />
                <Route path="/student/discover/:id" element={<StudentDiscoveryDetailPage />} />
                <Route path="/student/intelligence" element={<CareerIntelligencePage />} />
                <Route path="/student/gaps" element={<GapAnalysisPage />} />
                <Route path="/student/opportunities" element={<StudentOpportunitiesPage />} />
                <Route path="/student/connections" element={<StudentConnectionsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/student/settings" element={<StudentSettingsPage />} />
                <Route path="/career-goals" element={<CareerGoalsPage />} />
                <Route path="/evidence" element={<EvidencePage />} />
                <Route path="/student/assessments" element={<AssessmentsListPage />} />
                <Route path="/student/assessments/:assessmentId/attempts/:attemptId" element={<AssessmentTakingPage />} />
                <Route path="/student/assessments/attempts/:attemptId/result" element={<AssessmentResultPage />} />
              </Route>

              {/* Recruiter / Admin Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']} />}>
                <Route path="/recruiter/opportunities" element={<OpportunitiesPage />} />
                <Route path="/recruiter/connections" element={<RecruiterConnectionsPage />} />
                <Route path="/recruiter/opportunities/new" element={<CreateOpportunityPage />} />
                <Route path="/recruiter/opportunities/:id" element={<OpportunityDetailPage />} />
                <Route path="/recruiter/verifications" element={<VerificationPage />} />
                <Route path="/recruiter/candidates" element={<RecruiterCandidatesPage />} />
                <Route path="/recruiter/talent-search" element={<RecruiterTalentSearchPage />} />
                <Route path="/recruiter/shortlist" element={<RecruiterShortlistPage />} />
                <Route path="/recruiter/applications" element={<RecruiterApplicationsPage />} />
                <Route path="/recruiter/messages" element={<RecruiterMessagesPage />} />
                <Route path="/recruiter/assessments" element={<RecruiterAssessmentsPage />} />
                <Route path="/recruiter/analytics" element={<RecruiterAnalyticsPage />} />
                <Route path="/recruiter/organization" element={<RecruiterOrganizationPage />} />
                <Route path="/recruiter/settings" element={<RecruiterSettingsPage />} />
                <Route path="/recruiter/help" element={<RecruiterHelpPage />} />
              </Route>
            </Route>

            {/* Duplicate / Legacy Routes with Clean Redirects */}
            <Route path="/student/career-intelligence" element={<Navigate to="/student/intelligence" replace />} />
            <Route path="/verifications" element={<Navigate to="/recruiter/verifications" replace />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
