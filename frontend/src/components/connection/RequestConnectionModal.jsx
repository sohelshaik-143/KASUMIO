import React, { useState, useEffect } from 'react';
import { 
  Send, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Field } from '../common/Field';

export const RequestConnectionModal = ({
  isOpen,
  onClose,
  opportunity,
  opportunityTitle,
  candidate,
  candidateAlias,
  onConfirm
}) => {
  const resolvedCandidateAlias = 
    candidate?.candidateAlias || 
    candidateAlias || 
    (typeof candidate === 'string' ? candidate : null);

  const resolvedOpportunityTitle = 
    opportunity?.title || 
    opportunityTitle || 
    'this opportunity';

  if (!isOpen || !resolvedCandidateAlias) return null;

  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setNote('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await onConfirm(resolvedCandidateAlias, note.trim() || null);
      onClose();
    } catch (err) {
      console.error('Failed to request connection:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to send connection request.';
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Express Interest & Request Connection"
      description={`Connecting with candidate ${resolvedCandidateAlias}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Privacy Protocol Notice */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1.5">
          <p className="font-semibold text-teal-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
            <span>KASUMIO Privacy Protocol</span>
          </p>
          <p className="text-slate-600 leading-relaxed text-xs">
            The candidate will be notified of your interest in connection with <span className="text-slate-900 font-semibold">{resolvedOpportunityTitle}</span>. Their identity remains private until they choose to accept and share permitted contact details.
          </p>
        </div>

        {/* Optional Message */}
        <Field
          label="Professional Note to Candidate (Optional)"
          hint="A connection request will remain pending for 14 days or until the candidate responds."
        >
          {({ id, describedBy }) => (
            <textarea
              id={id}
              aria-describedby={describedBy}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., We were impressed by your demonstrated evidence in Java and Spring Boot and would love to connect about this role."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
            />
          )}
        </Field>

        {/* Actions */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 bg-white border border-slate-300 rounded-lg transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg shadow-xs transition disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>{submitting ? 'Sending Request...' : 'Send Connection Request'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RequestConnectionModal;
