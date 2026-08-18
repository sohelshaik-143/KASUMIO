import React, { useState, useEffect } from 'react';
import { evidenceApi } from '../api/evidenceApi';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { EmptyState } from '../components/common/EmptyState';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Calendar, 
  Briefcase, 
  Sparkles, 
  Layers, 
  X 
} from 'lucide-react';

export const VerificationPage = () => {
  const { user, isRecruiter, isAdmin, loading: authLoading } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, REQUESTED, VERIFIED, REJECTED, EXPIRED
  const [alert, setAlert] = useState({ type: null, message: null });

  // Modal review state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [recruiterComment, setRecruiterComment] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchQueue = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await evidenceApi.getRecruiterQueue();
      setQueue(data || []);
    } catch (err) {
      console.error('Failed to load verification queue:', err);
      if (err.response?.status === 403) {
        setAlert({
          type: 'error',
          message: 'Access Denied: The Verification Queue requires a RECRUITER or ADMIN account.',
        });
      } else {
        const errMsg = err.response?.data?.message || 'Could not fetch verification requests.';
        setAlert({ type: 'error', message: errMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && (isRecruiter || isAdmin)) {
      fetchQueue();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user?.id, user?.role, isRecruiter, isAdmin]);

  const handleOpenReview = async (id) => {
    setReviewModalOpen(true);
    setLoadingDetail(true);
    setRecruiterComment('');

    try {
      const detail = await evidenceApi.getVerificationDetail(id);
      setSelectedRequest(detail);
      setRecruiterComment(detail.recruiterComment || '');
    } catch (err) {
      console.error('Failed to fetch verification detail:', err);
      setAlert({ type: 'error', message: 'Failed to load verification details.' });
      setReviewModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAction = async (actionType) => {
    if (!selectedRequest) return;

    try {
      setSubmittingAction(true);
      let updated;
      if (actionType === 'VERIFY') {
        updated = await evidenceApi.verifyRequest(selectedRequest.id, recruiterComment);
        setAlert({ type: 'success', message: `Evidence verified for candidate ${selectedRequest.candidateAlias}.` });
      } else {
        updated = await evidenceApi.rejectRequest(selectedRequest.id, recruiterComment);
        setAlert({ type: 'info', message: `Verification rejected for candidate ${selectedRequest.candidateAlias}.` });
      }

      // Update in queue list
      setQueue((prev) =>
        prev.map((item) => (item.id === updated.id ? { ...item, status: updated.status, recruiterComment: updated.recruiterComment, respondedAt: updated.respondedAt } : item))
      );
      setReviewModalOpen(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to process verification decision.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredQueue = queue.filter((item) => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  const pendingCount = queue.filter((i) => i.status === 'REQUESTED').length;
  const verifiedCount = queue.filter((i) => i.status === 'VERIFIED').length;
  const rejectedCount = queue.filter((i) => i.status === 'REJECTED').length;
  const expiredCount = queue.filter((i) => i.status === 'EXPIRED').length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSpinner size="lg" text="Loading verification queue telemetry..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Verification Queue
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Contextual, candidate-specific evidence review for your active role opportunities.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          <span className="font-mono">{pendingCount} Actionable Request{pendingCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'ALL'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          All ({queue.length})
        </button>

        <button
          onClick={() => setFilter('REQUESTED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            filter === 'REQUESTED'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending ({pendingCount})</span>
        </button>

        <button
          onClick={() => setFilter('VERIFIED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            filter === 'VERIFIED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Verified ({verifiedCount})</span>
        </button>

        <button
          onClick={() => setFilter('REJECTED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            filter === 'REJECTED'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Rejected ({rejectedCount})</span>
        </button>

        <button
          onClick={() => setFilter('EXPIRED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'EXPIRED'
              ? 'bg-slate-700 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Expired ({expiredCount})
        </button>
      </div>

      {/* Queue List */}
      {filteredQueue.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No verification requests"
          description={
            filter === 'ALL'
              ? 'You have not requested verification for any candidate evidence yet. Open any matched candidate in your opportunities to request verification.'
              : `No verification requests in '${filter}' status.`
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQueue.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-xl transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Candidate Alias & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-300 text-sm">
                        {item.candidateAlias}
                      </span>
                      {item.hasExpressedInterest && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                          <Sparkles className="w-3 h-3 text-teal-400" />
                          <span>Candidate Interested</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-300 mt-1 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.opportunityTitle}</span>
                    </p>
                  </div>

                  {/* Status Badge */}
                  {item.status === 'REQUESTED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/90 text-amber-300 border border-amber-800">
                      <Clock className="w-3 h-3" />
                      <span>Pending Review</span>
                    </span>
                  )}
                  {item.status === 'VERIFIED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                  {item.status === 'REJECTED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/90 text-rose-300 border border-rose-800">
                      <XCircle className="w-3 h-3" />
                      <span>Rejected</span>
                    </span>
                  )}
                  {item.status === 'EXPIRED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      <span>Expired</span>
                    </span>
                  )}
                </div>

                {/* Evidence Details */}
                <div className="bg-slate-850/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                      {item.skillName}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.evidenceType}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">
                    {item.evidenceTitle}
                  </h4>
                  {item.recruiterComment && (
                    <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-800">
                      "{item.recruiterComment}"
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Requested {new Date(item.requestedAt).toLocaleDateString()}</span>
                </span>

                <button
                  onClick={() => handleOpenReview(item.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-teal-300 hover:text-teal-200 text-xs font-semibold rounded-xl border border-slate-700/80 transition active:scale-98"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{item.status === 'REQUESTED' ? 'Review & Action' : 'View Details'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in-50 duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Review Evidence Verification
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Confirm demonstrated capability for role opportunity.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {loadingDetail || !selectedRequest ? (
                <LoadingSpinner size="md" text="Loading verification dossier..." />
              ) : (
                <div className="space-y-4">
                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-850/80 p-3.5 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">
                        Candidate
                      </span>
                      <span className="font-mono font-bold text-teal-300 text-sm">
                        {selectedRequest.candidateAlias}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">
                        Opportunity
                      </span>
                      <span className="font-semibold text-white">
                        {selectedRequest.opportunityTitle}
                      </span>
                    </div>
                  </div>

                  {/* Evidence Dossier */}
                  <div className="bg-slate-850/80 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                        {selectedRequest.skillName}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {selectedRequest.evidenceType}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white tracking-tight">
                      {selectedRequest.evidenceTitle}
                    </h4>

                    {selectedRequest.evidenceDescription && (
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedRequest.evidenceDescription}
                      </p>
                    )}

                    {selectedRequest.evidenceUrl && (
                      <div className="pt-2">
                        <a
                          href={selectedRequest.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-2"
                        >
                          <span>Inspect Live / External Proof</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Recruiter Comment Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Recruiter Note / Assessment Comment <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Demonstrated required concurrency logic and clean architecture."
                      value={recruiterComment}
                      onChange={(e) => setRecruiterComment(e.target.value)}
                      className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none transition"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Private assessment note recorded for verification audit trail.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            {selectedRequest && (
              <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-xl transition"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={() => handleAction('REJECT')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold rounded-xl transition disabled:opacity-50 active:scale-98"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Verification</span>
                </button>

                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={() => handleAction('VERIFY')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50 active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Evidence</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
