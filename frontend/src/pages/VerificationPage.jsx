import React, { useState, useEffect } from 'react';
import { evidenceApi } from '../api/evidenceApi';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { Field } from '../components/common/Field';
import { ShieldCheck, CheckCircle2, Clock, ExternalLink } from 'lucide-react';

export const VerificationPage = () => {
  const { user, isRecruiter, isAdmin, loading: authLoading } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [alert, setAlert] = useState({ type: null, message: null });

  // Modal review state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [, setLoadingDetail] = useState(false);
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
          message: 'Access Denied: The Verification Queue requires an approved RECRUITER or ADMIN account.',
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
      await evidenceApi.submitDecision(selectedRequest.id, {
        status: actionType === 'VERIFY' ? 'VERIFIED' : 'REJECTED',
        comment: recruiterComment.trim() || undefined,
      });

      setAlert({
        type: 'success',
        message: `Verification request ${actionType === 'VERIFY' ? 'approved' : 'rejected'}.`,
      });
      setReviewModalOpen(false);
      setSelectedRequest(null);
      await fetchQueue();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to process verification decision.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredQueue = queue.filter((item) => {
    if (filter === 'PENDING') return item.status === 'PENDING';
    if (filter === 'VERIFIED') return item.status === 'VERIFIED';
    if (filter === 'REJECTED') return item.status === 'REJECTED';
    return true;
  });

  const pendingCount = queue.filter((i) => i.status === 'PENDING').length;
  const verifiedCount = queue.filter((i) => i.status === 'VERIFIED').length;
  const rejectedCount = queue.filter((i) => i.status === 'REJECTED').length;

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingSpinner size="lg" text="Loading verification requests..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Evidence Verification Queue
            </h1>
          </div>
          <p className="text-sm text-slate-600">
            Review and audit verifiable project artifacts submitted by candidates for your opportunities.
          </p>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Verification queue filter">
        {[
          { key: 'ALL', label: `All (${queue.length})` },
          { key: 'PENDING', label: `Pending (${pendingCount})` },
          { key: 'VERIFIED', label: `Verified (${verifiedCount})` },
          { key: 'REJECTED', label: `Rejected (${rejectedCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={filter === tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 ${
              filter === tab.key
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
              className="bg-white border border-slate-200 hover:border-teal-300 rounded-xl p-5 sm:p-6 shadow-xs transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                      {item.skillName}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Candidate: {item.candidateAlias}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{item.evidenceTitle}</h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Opportunity: <span className="font-semibold text-slate-900">{item.opportunityTitle}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenReview(item.id)}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
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
      <Modal
        isOpen={reviewModalOpen && Boolean(selectedRequest)}
        onClose={() => setReviewModalOpen(false)}
        title="Audit Verification Request"
        description={`Candidate: ${selectedRequest?.candidateAlias || ''}`}
        maxWidth="max-w-xl"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-900 block text-sm">{selectedRequest.evidenceTitle}</span>
              <p className="text-slate-700 leading-relaxed">{selectedRequest.evidenceDescription}</p>
              {selectedRequest.evidenceUrl && (
                <a
                  href={selectedRequest.evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-teal-700 font-semibold pt-1 hover:text-teal-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
                >
                  <span>Inspect Evidence Source</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              )}
            </div>

            <Field label="Audit Notes / Feedback" hint="Enter audit rationale for verification decision">
              {({ id, describedBy }) => (
                <textarea
                  id={id}
                  aria-describedby={describedBy}
                  rows={3}
                  value={recruiterComment}
                  onChange={(e) => setRecruiterComment(e.target.value)}
                  placeholder="Enter audit rationale for verification decision..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
                />
              )}
            </Field>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                disabled={submittingAction}
                onClick={() => handleAction('REJECT')}
                className="px-4 py-2 bg-white border border-slate-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                Reject Verification
              </button>
              <button
                type="button"
                disabled={submittingAction}
                onClick={() => handleAction('VERIFY')}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
              >
                Approve & Verify
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VerificationPage;
