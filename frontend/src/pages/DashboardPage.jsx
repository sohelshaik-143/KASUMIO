import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentApi } from '../api/studentApi';
import { evidenceApi } from '../api/evidenceApi';
import { skillApi } from '../api/skillApi';
import { opportunityApi } from '../api/opportunityApi';
import { discoveryApi } from '../api/discoveryApi';
import { outcomeApi } from '../api/outcomeApi';
import { connectionApi } from '../api/connectionApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { TemplatePickerModal } from '../components/evidence/TemplatePickerModal';
import { EvidenceFormModal } from '../components/evidence/EvidenceFormModal';
import { CapabilityDetailModal } from '../components/capability/CapabilityDetailModal';
import { StudentDashboardView } from '../components/dashboard/StudentDashboardView';
import { RecruiterDashboardView } from '../components/dashboard/RecruiterDashboardView';

/**
 * DashboardPage - Main Role-Aware Dashboard Coordinator
 * Orchestrates real-data fetching and delegates rendering to specialized views.
 */
export const DashboardPage = () => {
  const { user, isStudent, isRecruiter, isAdmin, loading: authLoading } = useAuth();

  const [metrics, setMetrics] = useState(null);
  const [recentEvidence, setRecentEvidence] = useState([]);
  const [skills, setSkills] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [connections, setConnections] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [outcomeData, setOutcomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [selectedCapability, setSelectedCapability] = useState(null);
  const [capabilityModalOpen, setCapabilityModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      if (isStudent) {
        const [dashMetrics, evidenceList, skillList, templateList, connList, recsList, outcomeIntelligence] =
          await Promise.all([
            studentApi.getDashboard().catch(() => ({
              totalEvidenceCount: 0,
              verifiedEvidenceCount: 0,
              careerGoalsCount: 0,
              profileComplete: false,
            })),
            evidenceApi.getMyEvidence().catch(() => []),
            skillApi.getAllSkills().catch(() => []),
            evidenceApi.getTemplates().catch(() => []),
            connectionApi.getStudentConnections().catch(() => []),
            discoveryApi.getRecommendations({ limit: 5 }).catch(() => []),
            outcomeApi.getOutcomeIntelligence().catch(() => null),
          ]);

        setMetrics(dashMetrics);
        setRecentEvidence(evidenceList || []);
        setSkills(skillList || []);
        setTemplates(templateList || []);
        setConnections(connList || []);
        setRecommendations(recsList || []);
        setOutcomeData(outcomeIntelligence);
      } else if (isRecruiter || isAdmin) {
        const [pendingList, skillList, connList, oppList] = await Promise.all([
          evidenceApi.getPendingVerification().catch(() => []),
          skillApi.getAllSkills().catch(() => []),
          connectionApi.getRecruiterConnections().catch(() => []),
          opportunityApi.getMyOpportunities().catch(() => []),
        ]);

        setRecentEvidence(pendingList || []);
        setSkills(skillList || []);
        setConnections(connList || []);
        setOpportunities(oppList || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Could not load live dashboard data from database.');
    } finally {
      setLoading(false);
    }
  }, [user, isStudent, isRecruiter, isAdmin]);

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user, loadDashboardData]);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setTemplateModalOpen(false);
    setFormModalOpen(true);
  };

  const handleCreateEvidence = async (evidencePayload) => {
    await evidenceApi.createEvidence(evidencePayload);
    await loadDashboardData();
  };

  const handleRecalculateOutcome = async () => {
    try {
      const fresh = await outcomeApi.recalculate();
      setOutcomeData(fresh);
    } catch (err) {
      console.error('Error recalculating outcome intelligence:', err);
    }
  };

  const handleCapabilityClick = (skillObj, state) => {
    const evidenceCount = recentEvidence.filter((e) => e.skillId === skillObj.id).length;
    setSelectedCapability({
      id: skillObj.id,
      name: skillObj.name,
      category: skillObj.category,
      state: state,
      confidence: state === 'Strong' ? 95 : state === 'Developing' ? 70 : 40,
      reasoning:
        state === 'Strong'
          ? `Backed by ${evidenceCount} verified/active portfolio proof submission(s).`
          : state === 'Developing'
          ? `Supported by practical evidence. Submit additional verification to reach Strong state.`
          : `Identified capability in growth stage. Recommend adding project repository proof.`,
      lastActivity: 'Recent',
    });
    setCapabilityModalOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" text="Retrieving live career records..." />
      </div>
    );
  }

  return (
    <>
      <Alert type="error" message={error} onClose={() => setError(null)} />

      {isRecruiter || isAdmin ? (
        <RecruiterDashboardView
          user={user}
          opportunities={opportunities}
          recentEvidence={recentEvidence}
          connections={connections}
          skills={skills}
          greeting={getGreeting()}
        />
      ) : (
        <StudentDashboardView
          user={user}
          metrics={metrics}
          recentEvidence={recentEvidence}
          skills={skills}
          connections={connections}
          recommendations={recommendations}
          outcomeData={outcomeData}
          greeting={getGreeting()}
          onOpenTemplatePicker={() => setTemplateModalOpen(true)}
          onOpenDirectForm={() => {
            setSelectedTemplate(null);
            setFormModalOpen(true);
          }}
          onCapabilityClick={handleCapabilityClick}
          onActionUpdated={loadDashboardData}
          onRecalculateOutcome={handleRecalculateOutcome}
        />
      )}

      {/* Global Modals for Evidence & Capability Inspection */}
      <TemplatePickerModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        templates={templates}
        onSelectTemplate={handleSelectTemplate}
      />

      <EvidenceFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedTemplate(null);
        }}
        onSubmit={handleCreateEvidence}
        skills={skills}
        templateData={selectedTemplate}
      />

      <CapabilityDetailModal
        isOpen={capabilityModalOpen}
        onClose={() => setCapabilityModalOpen(false)}
        capability={selectedCapability}
        evidenceList={recentEvidence}
        opportunities={recommendations}
      />
    </>
  );
};

export default DashboardPage;
