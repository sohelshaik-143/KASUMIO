import React, { useState } from 'react';
import { 
  Heart, 
  Send, 
  X, 
  ShieldCheck, 
  AlertCircle,
  Clock
} from 'lucide-react';

export const RequestConnectionModal = ({
  isOpen,
  onClose,
  opportunity,
  candidate,
  onConfirm
}) => {
  if (!isOpen || !candidate) return null;

  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onConfirm(candidate.candidateAlias, note.trim() || null);
      onClose();
    } catch (err) {
      console.error('Failed to request connection:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in-50 duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Express Interest & Request Connection
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Connecting with candidate <span className="font-mono text-teal-300 font-semibold">{candidate.candidateAlias}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Privacy Protocol Notice */}
          <div className="bg-slate-925/90 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 space-y-1.5">
            <p className="font-semibold text-teal-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>KASUMIO Privacy Protocol</span>
            </p>
            <p className="text-slate-300/90 leading-relaxed text-[11px]">
              The candidate will be notified of your interest in connection with <span className="text-white font-medium">{opportunity?.title}</span>. Their identity remains private until they choose to accept and share permitted contact details.
            </p>
          </div>

          {/* Optional Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Professional Note to Candidate (Optional)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., We were impressed by your demonstrated evidence in Java and Spring Boot and would love to connect about this role."
              className="w-full bg-slate-850 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
            />
            <span className="text-[10px] text-slate-500 block">
              A connection request will remain pending for 14 days or until the candidate responds.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50 active:scale-98"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Sending Request...' : 'Send Connection Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
