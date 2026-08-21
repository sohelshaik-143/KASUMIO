import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { opportunityApi } from '../../api/opportunityApi';
import { evidenceApi } from '../../api/evidenceApi';
import { connectionApi } from '../../api/connectionApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { RequestConnectionModal } from '../../components/connection/RequestConnectionModal';
import { DisclosedProfileModal } from '../../components/connection/DisclosedProfileModal';
import { 
  Briefcase, 
  Layers, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Users, 
  ArrowLeft, 
  ShieldCheck, 
  Eye, 
  ExternalLink, 
  X 
} from 'lucide-react';

export const OpportunityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isRecruiter, isAdmin, loading: authLoading } = useAuth();

  const [opportunity, setOpportunity] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState({ type: null, message: null });

  // Anonymous Candidate Evidence Review Modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectingAlias, setInspectingAlias] = useState(null);
  const [candidateEvidence, setCandidateEvidence] = useState([]);
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [requestingVerifId, setRequestingVerifId] = useState(null);

  // Connection Modals State
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [connectingCandidate, setConnectingCandidate] = useState(null);
  const [disclosedModalOpen, setDisclosedModalOpen] = useState(false);
  const [activeDisclosedConnection, setActiveDisclosedConnection] = useState(null);

  const handleOpenConnectModal = (candidate) => {
    setConnectingCandidate(candidate);
    setConnectModalOpen(true);
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
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to express interest and request connection.';
      setAlert({ type: 'error', message: errMsg });
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

  const handleRequestVerification = async (evidenceId) => {
    try {
      setRequestingVerifId(evidenceId);
      await evidenceApi.requestVerification(id, inspectingAlias, evidenceId);
      
      setCandidateEvidence((prev) =>
        prev.map((item) =>
          item.evidenceId === evidenceId
            ? { ...item, opportunityVerificationStatus: 'REQUESTED' }
            : item
        )
      );
      setAlert({ type: 'success', message: 'Verification request created. View and action requests in your Verification Queue.' });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to request verification.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setRequestingVerifId(null);
    }
  };

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const oppData = await opportunityApi.getOpportunityById(id);
      setOpportunity(oppData);

      if (oppData.status === 'PUBLISHED') {
        const matchesData = await opportunityApi.getMatches(id).catch(() => []);
        setMatches(matchesData || []);
      } else {
        setMatches([]);
      }
    } catch (err) {
      console.error('Failed to load opportunity details:', err);
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
      if (err.response?.status === 403) {
        setAlert({
          type: 'error',
          message: 'Access Denied: Only the Recruiter who created this opportunity can publish it.',
        });
      } else {
        const errMsg = err.response?.data?.message || 'Failed to publish opportunity.';
        setAlert({ type: 'error', message: errMsg });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm('Are you sure you want to close this opportunity? Active candidate matching will stop.')) {
      return;
    }
    try {
      setActionLoading(true);
      const updated = await opportunityApi.closeOpportunity(id);
      setOpportunity(updated);
      setMatches([]);
      setAlert({ type: 'info', message: 'Opportunity closed. Matching paused.' });
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
      console.error('Failed to load candidate evidence:', err);
      const errMsg = err.response?.data?.message || 'Could not retrieve anonymous candidate evidence.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setLoadingEvidence(false);
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
      {/* Top navigation */}
      <div className="flex items-center gap-2">
        <Link
          to="/recruiter/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
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

      {/* Opportunity Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase font-semibold">
                {opportunity.type} • {opportunity.workType}
              </span>
              {opportunity.status === 'PUBLISHED' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  PUBLISHED
                </span>
              )}
              {opportunity.status === 'DRAFT' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-3 h-3 text-amber-600" />
                  DRAFT
                </span>
              )}
              {opportunity.status === 'CLOSED' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  <XCircle className="w-3 h-3 text-slate-400" />
                  CLOSED
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {opportunity.title}
            </h1>

            {opportunity.location && (
              <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{opportunity.location}</span>
              </p>
            )}
          </div>

          {/* Recruiter Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {opportunity.status === 'DRAFT' && (
              <button
                disabled={actionLoading}
                onClick={handlePublish}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Opportunity</span>
              </button>
            )}

            {opportunity.status === 'PUBLISHED' && (
              <button
                disabled={actionLoading}
                onClick={handleClose}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Close Opportunity</span>
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
          {opportunity.description}
        </p>

        {/* Skill Requirements Summary */}
        <div className="pt-2 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Capability Requirements</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {opportunity.skills?.map((s) => (
              <span
                key={s.skillId}
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl border font-medium ${
                  s.skillType === 'REQUIRED'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{s.skillName}</span>
                <span className="text-[10px] uppercase opacity-75 font-mono">({s.skillType})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Candidate Matches Feed */}
      {opportunity.status === 'PUBLISHED' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Matched Anonymous Candidates ({matches.length})</span>
            </div>
          </div>

          {matches.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No candidate matches yet"
              description="Candidates will appear here automatically when their verified proof footprint satisfies your required skill criteria."
            />
          ) : (
            <div className="space-y-4">
              {matches.map((candidate) => (
                <div
                  key={candidate.candidateAlias}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 sm:p-6 shadow-xs transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Candidate #{candidate.candidateAlias}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Matches <strong className="text-indigo-600">{candidate.matchedRequiredSkillsCount}</strong> required skills
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleInspectEvidence(candidate.candidateAlias)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Evidence</span>
                      </button>

                      {candidate.connectionStatus === 'ACCEPTED' ? (
                        <button
                          onClick={() => handleViewDisclosedProfile(candidate.connectionId)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>View Contact Info</span>
                        </button>
                      ) : candidate.connectionStatus === 'PENDING' ? (
                        <span className="px-3.5 py-2 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-xl">
                          Request Pending
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenConnectModal(candidate)}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                        >
                          Request Connection
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Anonymous Evidence Modal */}
      {inspectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setInspectModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 space-y-5 z-10 my-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Proof Inspection — Candidate #{inspectingAlias}</h3>
                <p className="text-xs text-slate-500">Anonymous demonstrable evidence footprint</p>
              </div>
              <button onClick={() => setInspectModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingEvidence ? (
              <LoadingSpinner size="md" text="Fetching verified evidence..." />
            ) : candidateEvidence.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No public evidence artifacts submitted.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {candidateEvidence.map((ev) => (
                  <div key={ev.evidenceId} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{ev.title}</span>
                      <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                        {ev.skillName}
                      </span>
                    </div>
                    <p className="text-slate-600">{ev.description}</p>
                    {ev.evidenceUrl && (
                      <a
                        href={ev.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 font-semibold"
                      >
                        <span>Inspect Evidence Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <RequestConnectionModal
        isOpen={connectModalOpen}
        onClose={() => {
          setConnectModalOpen(false);
          setConnectingCandidate(null);
        }}
        onConfirm={handleConfirmRequestConnection}
        candidateAlias={connectingCandidate?.candidateAlias}
        opportunityTitle={opportunity.title}
      />

      <DisclosedProfileModal
        isOpen={disclosedModalOpen}
        onClose={() => {
          setDisclosedModalOpen(false);
          setActiveDisclosedConnection(null);
        }}
        connection={activeDisclosedConnection}
      />
    </div>
  );
};

export default OpportunityDetailPage;
