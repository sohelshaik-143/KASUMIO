import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { opportunityApi } from '../../api/opportunityApi';
import { evidenceApi } from '../../api/evidenceApi';
import { connectionApi } from '../../api/connectionApi';
import { assessmentApi } from '../../api/assessmentApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { RequestConnectionModal } from '../../components/connection/RequestConnectionModal';
import { DisclosedProfileModal } from '../../components/connection/DisclosedProfileModal';
import { CandidateAssessmentModal } from '../../components/recruiter/CandidateAssessmentModal';
import { AnonymousEvidenceModal } from '../../components/recruiter/AnonymousEvidenceModal';
import { OpportunityRequirementsCard } from '../../components/recruiter/OpportunityRequirementsCard';
import { CandidateMatchesSection } from '../../components/recruiter/CandidateMatchesSection';
import { ArrowLeft } from 'lucide-react';

/**
 * OpportunityDetailPage coordinates opportunity data, screening blueprint, and candidate matching.
 */
export const OpportunityDetailPage = () => {
  const { id } = useParams();
  const { user, isRecruiter, isAdmin, loading: authLoading } = useAuth();

  const [opportunity, setOpportunity] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [alert, setAlert] = useState({ type: null, message: null });

  // Anonymous Candidate Evidence Review Modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectingAlias, setInspectingAlias] = useState(null);
  const [candidateEvidence, setCandidateEvidence] = useState([]);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  // Candidate Assessment Inspection Modal
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [candidateAssessmentData, setCandidateAssessmentData] = useState(null);
  const [loadingCandidateAssessment, setLoadingCandidateAssessment] = useState(false);
  const [inspectingAssessmentCandidate, setInspectingAssessmentCandidate] = useState(null);

  // Connection Modals State
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [connectingCandidate, setConnectingCandidate] = useState(null);
  const [disclosedModalOpen, setDisclosedModalOpen] = useState(false);
  const [activeDisclosedConnection, setActiveDisclosedConnection] = useState(null);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [oppData, assmData] = await Promise.all([
        opportunityApi.getOpportunityById(id),
        assessmentApi.getAssessmentForOpportunity(id).catch(() => null)
      ]);
      setOpportunity(oppData);
      setAssessment(assmData);

      if (oppData.status === 'PUBLISHED') {
        const matchesData = await opportunityApi.getMatches(id).catch(() => []);
        setMatches(matchesData || []);
      } else {
        setMatches([]);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Could not load opportunity details.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && (isRecruiter || isAdmin)) {
      loadData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [id, authLoading, user?.id, user?.role, isRecruiter, isAdmin]);

  const handlePublish = async () => {
    try {
      setActionLoading(true);
      const updated = await opportunityApi.publishOpportunity(id);
      setOpportunity(updated);
      setAlert({ type: 'success', message: 'Opportunity successfully published! Finding matching candidate proof...' });
      const matchesData = await opportunityApi.getMatches(id).catch(() => []);
      setMatches(matchesData || []);
    } catch (err) {
      const errMsg = err.response?.status === 403
        ? 'Access Denied: Only the Recruiter who created this opportunity can publish it.'
        : err.response?.data?.message || 'Failed to publish opportunity.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmClose = async () => {
    try {
      setActionLoading(true);
      const updated = await opportunityApi.closeOpportunity(id);
      setOpportunity(updated);
      setMatches([]);
      setAlert({ type: 'info', message: 'Opportunity closed. Matching paused.' });
      setShowCloseConfirm(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to close opportunity.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleInspectEvidence = async (candidateAlias) => {
    setInspectingAlias(candidateAlias);
    setInspectModalOpen(true);
    setLoadingEvidence(true);
    try {
      const evData = await opportunityApi.getCandidateEvidence(id, candidateAlias).catch(() => []);
      setCandidateEvidence(evData || []);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Could not retrieve anonymous candidate evidence.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setLoadingEvidence(false);
    }
  };

  const handleViewCandidateAssessment = async (candidate) => {
    try {
      setInspectingAssessmentCandidate(candidate);
      setAssessmentModalOpen(true);
      setLoadingCandidateAssessment(true);
      const data = await assessmentApi.getCandidateResultsByAliasForRecruiter(id, candidate.candidateAlias);
      setCandidateAssessmentData(data);
    } catch (err) {
      setAlert({
        type: 'info',
        message: `Candidate #${candidate.candidateAlias} has not yet completed the Round-1 Technical Screening attempt.`
      });
      setAssessmentModalOpen(false);
    } finally {
      setLoadingCandidateAssessment(false);
    }
  };

  const handleConfirmRequestConnection = async (candidateAlias, note) => {
    try {
      const conn = await connectionApi.requestConnection(id, candidateAlias, note);
      setMatches((prev) =>
        prev.map((m) =>
          m.candidateAlias === candidateAlias
            ? { ...m, connectionStatus: conn.status, connectionId: conn.id }
            : m
        )
      );
      setAlert({
        type: 'success',
        message: `Interest sent to candidate ${candidateAlias}. Waiting for their decision.`,
      });
      return conn;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to express interest and request connection.';
      setAlert({ type: 'error', message: errMsg });
      throw err;
    }
  };

  const handleViewDisclosedProfile = async (connectionId) => {
    try {
      const conn = await connectionApi.getRecruiterConnectionById(connectionId);
      setActiveDisclosedConnection(conn);
      setDisclosedModalOpen(true);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to retrieve consented candidate details.';
      setAlert({ type: 'error', message: errMsg });
    }
  };

  const handleCancelDisclosedConnection = async (connectionId) => {
    try {
      await connectionApi.cancelRecruiterConnection(connectionId);
      setMatches((prev) =>
        prev.map((m) =>
          m.connectionId === connectionId
            ? { ...m, connectionStatus: 'CANCELLED' }
            : m
        )
      );
      setAlert({ type: 'info', message: 'Connection disconnected.' });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to disconnect.';
      setAlert({ type: 'error', message: errMsg });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSpinner size="lg" text="Loading opportunity and match telemetry..." />
      </div>
    );
  }

  if (!opportunity) return null;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      <div className="flex items-center gap-2">
        <Link
          to="/recruiter/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </Link>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      <OpportunityRequirementsCard
        opportunity={opportunity}
        assessment={assessment}
        actionLoading={actionLoading}
        onPublish={handlePublish}
        onClose={() => setShowCloseConfirm(true)}
      />

      {opportunity.status === 'PUBLISHED' && (
        <CandidateMatchesSection
          matches={matches}
          onInspectEvidence={handleInspectEvidence}
          onViewAssessment={handleViewCandidateAssessment}
          onViewDisclosedProfile={handleViewDisclosedProfile}
          onOpenConnectModal={(cand) => {
            setConnectingCandidate(cand);
            setConnectModalOpen(true);
          }}
        />
      )}

      <AnonymousEvidenceModal
        isOpen={inspectModalOpen}
        onClose={() => setInspectModalOpen(false)}
        alias={inspectingAlias}
        evidence={candidateEvidence}
        loading={loadingEvidence}
      />

      <CandidateAssessmentModal
        isOpen={assessmentModalOpen}
        onClose={() => setAssessmentModalOpen(false)}
        candidate={inspectingAssessmentCandidate}
        opportunityId={id}
        assessmentData={candidateAssessmentData}
        loading={loadingCandidateAssessment}
        onDecisionUpdated={(updated) => setCandidateAssessmentData(updated)}
        onOpenConnect={(cand) => {
          setConnectingCandidate(cand);
          setConnectModalOpen(true);
        }}
      />

      <RequestConnectionModal
        isOpen={connectModalOpen}
        onClose={() => {
          setConnectModalOpen(false);
          setConnectingCandidate(null);
        }}
        onConfirm={handleConfirmRequestConnection}
        candidate={connectingCandidate}
        candidateAlias={connectingCandidate?.candidateAlias}
        opportunity={opportunity}
        opportunityTitle={opportunity?.title}
      />

      <DisclosedProfileModal
        isOpen={disclosedModalOpen}
        onClose={() => {
          setDisclosedModalOpen(false);
          setActiveDisclosedConnection(null);
        }}
        connection={activeDisclosedConnection}
        onCancelConnection={handleCancelDisclosedConnection}
      />

      <ConfirmDialog
        isOpen={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        title="Close Opportunity"
        message="Are you sure you want to close this opportunity? Active candidate matching will stop."
        confirmLabel="Close Opportunity"
        isDanger={true}
        isLoading={actionLoading}
        onConfirm={handleConfirmClose}
      />
    </div>
  );
};

export default OpportunityDetailPage;
