import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';

/**
 * Anonymous candidate evidence review modal.
 */
export const AnonymousEvidenceModal = ({
  isOpen,
  onClose,
  alias,
  evidence,
  loading
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Proof Inspection — Candidate #${alias}`}
      description="Anonymous demonstrable evidence footprint"
      maxWidth="max-w-2xl"
    >
      {loading ? (
        <div className="py-8">
          <LoadingSpinner size="md" text="Fetching verified evidence..." />
        </div>
      ) : (!evidence || evidence.length === 0) ? (
        <p className="text-sm text-slate-500 py-6 text-center">No public evidence artifacts submitted.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {evidence.map((ev) => (
            <div key={ev.evidenceId} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{ev.title}</span>
                <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                  {ev.skillName}
                </span>
              </div>
              <p className="text-slate-600">{ev.description}</p>
              {ev.evidenceUrl && (
                <a
                  href={ev.evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-semibold"
                >
                  <span>Inspect Evidence Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
