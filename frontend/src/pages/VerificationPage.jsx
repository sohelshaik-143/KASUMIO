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
  Layers, 
  X 
} from 'lucide-react';

export const VerificationPage = () => {
  const { user, isRecruiter, isAdmin, loading: authLoading } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSpinner size="lg" text="Loading verification queue..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Verification Queue
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Candidate-specific evidence audit and accredited verification for your active roles.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          <span className="font-mono">{pendingCount} Actionable Request{pendingCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'ALL'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          All ({queue.length})
        </button>

        <button
          onClick={() => setFilter('REQUESTED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            filter === 'REQUESTED'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending ({pendingCount})</span>
        </button>

        <button
          onClick={() => setFilter('VERIFIED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            filter === 'VERIFIED'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Verified ({verifiedCount})</span>
        </button>

        <button
          onClick={() => setFilter('REJECTED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            filter === 'REJECTED'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Rejected ({rejectedCount})</span>
        </button>
      </div>

      {/* Queue Items */}
      {filteredQueue.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No verification requests"
          description="Verification requests submitted by candidates for your opportunities will appear here for audit."
        />
      ) : (
        <div className="space-y-4">
          {filteredQueue.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 sm:p-6 shadow-xs transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {item.skillName}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
                      Candidate: {item.candidateAlias}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{item.evidenceTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Opportunity: <span className="font-semibold text-slate-800">{item.opportunityTitle}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenReview(item.id)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    Review & Audit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Audit Modal */}
      {reviewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setReviewModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 space-y-5 z-10 my-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Audit Verification Request</h3>
                <p className="text-xs text-slate-500">Candidate: {selectedRequest.candidateAlias}</p>
              </div>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 block">{selectedRequest.evidenceTitle}</span>
                <p className="text-slate-600 leading-relaxed">{selectedRequest.evidenceDescription}</p>
                {selectedRequest.evidenceUrl && (
                  <a
                    href={selectedRequest.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 font-semibold pt-1"
                  >
                    <span>Inspect Evidence Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Audit Notes / Feedback</label>
                <textarea
                  rows={3}
                  value={recruiterComment}
                  onChange={(e) => setRecruiterComment(e.target.value)}
                  placeholder="Enter audit rationale for verification decision..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                disabled={submittingAction}
                onClick={() => handleAction('REJECT')}
                className="px-4 py-2 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl"
              >
                Reject Verification
              </button>
              <button
                disabled={submittingAction}
                onClick={() => handleAction('VERIFY')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Approve & Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
