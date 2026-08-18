import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { KasumoLayout } from './components/layout/KasumoLayout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { CareerGoalsPage } from './pages/CareerGoalsPage';
import { EvidencePage } from './pages/EvidencePage';
import { VerificationPage } from './pages/VerificationPage';
import { StudentOpportunitiesPage } from './pages/student/StudentOpportunitiesPage';
import { OpportunityDiscoveryPage } from './pages/student/OpportunityDiscoveryPage';
import { OpportunityDetailPage as StudentDiscoveryDetailPage } from './pages/student/OpportunityDetailPage';
import { GapAnalysisPage } from './pages/student/GapAnalysisPage';
import { CareerIntelligencePage } from './pages/student/CareerIntelligencePage';
import { StudentConnectionsPage } from './pages/student/StudentConnectionsPage';
import { OpportunitiesPage } from './pages/recruiter/OpportunitiesPage';
import { CreateOpportunityPage } from './pages/recruiter/CreateOpportunityPage';
import { OpportunityDetailPage } from './pages/recruiter/OpportunityDetailPage';
import { RecruiterConnectionsPage } from './pages/recruiter/RecruiterConnectionsPage';

export function App() {
  return (
    <Router>
      <AuthProvider>
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
      </AuthProvider>
    </Router>
  );
}

export default App;
