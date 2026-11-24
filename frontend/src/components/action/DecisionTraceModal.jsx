import React from 'react';
import { ShieldCheck, AlertCircle, FileCode, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';

export function DecisionTraceModal({ isOpen, onClose, traces = [] }) {
  const getTraceIcon = (type) => {
    switch (type) {
      case 'EVIDENCE_VERIFIED':
        return <ShieldCheck className="w-4 h-4 text-teal-700" aria-hidden="true" />;
      case 'ACTION_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-blue-700" aria-hidden="true" />;
      case 'EVIDENCE_SUBMITTED':
        return <FileCode className="w-4 h-4 text-cyan-700" aria-hidden="true" />;
      case 'EVIDENCE_REJECTED':
      case 'EVIDENCE_DELETED':
        return <AlertCircle className="w-4 h-4 text-rose-700" aria-hidden="true" />;
      default:
        return <RefreshCw className="w-4 h-4 text-amber-700" aria-hidden="true" />;
    }
  };

  const getTraceBadgeColor = (type) => {
    switch (type) {
      case 'EVIDENCE_VERIFIED':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'ACTION_COMPLETED':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'EVIDENCE_SUBMITTED':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'EVIDENCE_REJECTED':
      case 'EVIDENCE_DELETED':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Decision Trace Audit Log"
      description="Deterministic record answering 'Why did my intelligence status change?'"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {traces.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm font-medium">No decision traces recorded yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Complete actions or upload evidence to populate your outcome decision log.
            </p>
          </div>
        ) : (
          traces.map((trace) => (
            <div
              key={trace.id}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                    {getTraceIcon(trace.traceType)}
                  </div>
                  <span className="font-semibold text-slate-900 text-sm">
                    {trace.targetSkillName}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-medium ${getTraceBadgeColor(
                      trace.traceType
                    )}`}
                  >
                    {trace.traceType}
                  </span>
                </div>

                <span className="text-xs text-slate-500 font-mono">
                  {trace.createdAt ? new Date(trace.createdAt).toLocaleString() : 'Recent'}
                </span>
              </div>

              <div className="flex items-center gap-2 my-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-mono">
                  BEFORE: {trace.beforeState}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-200 font-mono font-semibold">
                  AFTER: {trace.afterState}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed mt-2 bg-white p-2.5 rounded-lg border border-slate-200">
                {trace.explanation}
              </p>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200 text-xs text-slate-500">
                <span>
                  Rule: <code className="text-slate-800 font-mono">{trace.ruleApplied}</code>
                </span>
                <span>
                  Impact:{' '}
                  <strong className="text-teal-800 font-semibold">
                    {trace.opportunityImpactCount} Opportunity(ies)
                  </strong>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2"
        >
          Close Audit Log
        </button>
      </div>
    </Modal>
  );
}

export default DecisionTraceModal;
