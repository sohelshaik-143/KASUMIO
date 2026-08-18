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
  X, 
  Heart, 
  Sparkles, 
  Calendar, 
  Send 
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
      
      // Update local state to reflect REQUESTED status immediately
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
          message: 'Access Denied: Only the Recruiter who created this opportunity can publish it. Please make sure you are signed in to the correct Recruiter account.',
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

  const levelBadge = (status) => {
    switch (status) {
      case 'STRONG_EVIDENCE':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
            Strong Evidence
          </span>
        );
      case 'LIMITED_EVIDENCE':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
            Limited Evidence
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700">
            No Evidence
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Top navigation */}
      <div className="flex items-center gap-2">
        <Link
          to="/recruiter/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
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
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-slate-850 text-teal-400 border border-slate-750 uppercase font-semibold">
                {opportunity.type} • {opportunity.workType}
              </span>
              {opportunity.status === 'PUBLISHED' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/80">
                  <CheckCircle2 className="w-3 h-3" />
                  PUBLISHED
                </span>
              )}
              {opportunity.status === 'DRAFT' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60">
                  <Clock className="w-3 h-3" />
                  DRAFT
                </span>
              )}
              {opportunity.status === 'CLOSED' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  <XCircle className="w-3 h-3" />
                  CLOSED
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {opportunity.title}
            </h1>

            {opportunity.location && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{opportunity.location}</span>
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {opportunity.status === 'DRAFT' && (
              <button
                onClick={handlePublish}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Opportunity</span>
              </button>
            )}

            {opportunity.status === 'PUBLISHED' && (
              <button
                onClick={handleClose}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-red-950 hover:text-red-300 border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Close Opportunity</span>
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="border-t border-slate-800 pt-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Description
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {opportunity.description}
          </p>
        </div>

        {/* Skill Requirements Overview */}
        <div className="border-t border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block mb-2">
              Required Capabilities ({opportunity.requiredSkills.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.requiredSkills.map((s) => (
                <span
                  key={s.skillId}
                  className="text-xs px-2.5 py-1 rounded bg-teal-950/60 text-teal-300 border border-teal-800/60 font-medium"
                >
                  {s.skillName}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">
              Preferred Capabilities ({opportunity.preferredSkills.length})
            </span>
            {opportunity.preferredSkills.length === 0 ? (
              <span className="text-xs text-slate-500 italic">None specified</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {opportunity.preferredSkills.map((s) => (
                  <span
                    key={s.skillId}
                    className="text-xs px-2.5 py-1 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 font-medium"
                  >
                    {s.skillName}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Matched Candidates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold text-white">
              Anonymous Evidence-Matched Candidates ({matches.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Deterministic matching (minimum 50% required proof threshold)
          </span>
        </div>

        {opportunity.status === 'DRAFT' ? (
          <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-xl p-8 text-center max-w-md mx-auto">
            <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">Opportunity is in DRAFT</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Publish this opportunity to activate capability matching against student evidence records.
            </p>
            <button
              onClick={handlePublish}
              disabled={actionLoading}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Publish Now
            </button>
          </div>
        ) : matches.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No matching candidates surfaced yet"
            description="No student accounts currently have sufficient demonstrable evidence meeting at least 50% of the required capability threshold."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((candidate) => (
              <div
                key={candidate.candidateAlias}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition flex flex-col justify-between group shadow-sm"
              >
                <div>
                  {/* Candidate Alias Header & Expression of Interest */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-white bg-slate-850 px-2.5 py-1 rounded border border-slate-700">
                        {candidate.candidateAlias}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                        Anonymous
                      </span>
                    </div>

                    {candidate.hasExpressedInterest ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-800/70 shadow-sm animate-pulse">
                        <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                        <span>Expressed Interest</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium">
                        Discovered Match
                      </span>
                    )}
                  </div>

                  {/* Required Skills Matrix */}
                  <div className="space-y-2 mb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Required Skills
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {candidate.requiredSkills.map((s) => (
                        <div
                          key={s.skill}
                          className="flex items-center justify-between p-2 rounded bg-slate-850 border border-slate-800 text-xs"
                        >
                          <span className="font-semibold text-slate-200">{s.skill}</span>
                          <div className="flex items-center gap-1">
                            {levelBadge(s.status)}
                            {s.verified && (
                              <span title="Verified by Institution" className="text-emerald-400">
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Skills Matrix */}
                  {candidate.preferredSkills.length > 0 && (
                    <div className="space-y-2 mb-3">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Preferred Skills
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {candidate.preferredSkills.map((s) => (
                          <div
                            key={s.skill}
                            className="flex items-center justify-between p-2 rounded bg-slate-850 border border-slate-800 text-xs"
                          >
                            <span className="font-semibold text-slate-200">{s.skill}</span>
                            <div className="flex items-center gap-1">
                              {levelBadge(s.status)}
                              {s.verified && (
                                <span title="Verified by Institution" className="text-emerald-400">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Why Surfaced Explanation */}
                  <div className="bg-slate-850/80 border border-slate-800 rounded-lg p-3 my-3">
                    <p className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider mb-1">
                      Why Surfaced
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      "{candidate.whySurfaced}"
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {candidate.connectionStatus === 'ACCEPTED' ? (
                      <button
                        onClick={() => handleViewDisclosedProfile(candidate.connectionId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 text-xs font-semibold rounded-lg transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Connected • View Permitted Info</span>
                      </button>
                    ) : candidate.connectionStatus === 'PENDING' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Interest Sent • Waiting for decision</span>
                      </span>
                    ) : candidate.connectionStatus === 'DECLINED' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-750">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Candidate Declined</span>
                      </span>
                    ) : candidate.connectionStatus === 'EXPIRED' ? (
                      <button
                        onClick={() => handleOpenConnectModal(candidate)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-semibold rounded-lg transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Re-request Connection (Expired)</span>
                      </button>
                    ) : candidate.connectionStatus === 'CANCELLED' ? (
                      <button
                        onClick={() => handleOpenConnectModal(candidate)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-semibold rounded-lg transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Request Connection</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenConnectModal(candidate)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>Express Interest & Connect</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleInspectEvidence(candidate.candidateAlias)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review Evidence</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Anonymous Candidate Evidence Inspection Modal */}
      {inspectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white font-mono">
                    Candidate {inspectingAlias} — Demonstrated Evidence
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verifiable proof submissions matching required and preferred opportunity capabilities.
                </p>
              </div>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {loadingEvidence ? (
                <LoadingSpinner size="md" text="Loading candidate proof records..." />
              ) : candidateEvidence.length === 0 ? (
                <EmptyState
                  icon={ShieldCheck}
                  title="No relevant evidence records"
                  description="No evidence records found for this candidate connected to this opportunity's skills."
                />
              ) : (
                candidateEvidence.map((ev, index) => (
                  <div
                    key={index}
                    className="bg-slate-850 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-800/60">
                          {ev.skillName}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {ev.evidenceType}
                        </span>
                        {ev.recent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                            Recent
                          </span>
                        )}
                      </div>

                      {ev.verified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-700/80">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Verified by {ev.verificationOrgName || 'Institution'}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Unverified Submission</span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-white">{ev.title}</h4>
                    {ev.description && (
                      <p className="text-xs text-slate-300 leading-relaxed">{ev.description}</p>
                    )}

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(ev.createdAt).toLocaleDateString()}
                        </span>

                        {/* Opportunity-Specific Verification Status Badge */}
                        {ev.opportunityVerificationStatus === 'REQUESTED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800">
                            Verification Requested
                          </span>
                        )}
                        {ev.opportunityVerificationStatus === 'VERIFIED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified for Opportunity
                          </span>
                        )}
                        {ev.opportunityVerificationStatus === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-800">
                            Verification Not Accepted
                          </span>
                        )}
                        {ev.opportunityVerificationStatus === 'EXPIRED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                            Request Expired
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {ev.evidenceUrl && (
                          <a
                            href={ev.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-medium underline underline-offset-2"
                          >
                            <span>Inspect External Proof</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Request Verification Action */}
                        {(!ev.opportunityVerificationStatus || ev.opportunityVerificationStatus === 'UNVERIFIED' || ev.opportunityVerificationStatus === 'EXPIRED') && (
                          <button
                            type="button"
                            disabled={requestingVerifId === ev.evidenceId}
                            onClick={() => handleRequestVerification(ev.evidenceId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{requestingVerifId === ev.evidenceId ? 'Requesting...' : 'Request Verification'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
              <button
                onClick={() => setInspectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recruiter Express Interest / Request Connection Modal */}
      <RequestConnectionModal
        isOpen={connectModalOpen}
        onClose={() => {
          setConnectModalOpen(false);
          setConnectingCandidate(null);
        }}
        opportunity={opportunity}
        candidate={connectingCandidate}
        onConfirm={handleConfirmRequestConnection}
      />

      {/* Disclosed Profile Information Modal for Accepted Connections */}
      <DisclosedProfileModal
        isOpen={disclosedModalOpen}
        onClose={() => {
          setDisclosedModalOpen(false);
          setActiveDisclosedConnection(null);
        }}
        connection={activeDisclosedConnection}
        onCancelConnection={handleCancelDisclosedConnection}
      />
    </div>
  );
};
