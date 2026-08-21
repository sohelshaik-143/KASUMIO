import React from 'react';
import { X, ShieldCheck, AlertCircle, FileCode, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';

export function DecisionTraceModal({ isOpen, onClose, traces = [] }) {
  if (!isOpen) return null;

  const getTraceIcon = (type) => {
    switch (type) {
      case 'EVIDENCE_VERIFIED':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'ACTION_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-blue-400" />;
      case 'EVIDENCE_SUBMITTED':
        return <FileCode className="w-4 h-4 text-cyan-400" />;
      case 'EVIDENCE_REJECTED':
      case 'EVIDENCE_DELETED':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <RefreshCw className="w-4 h-4 text-amber-400" />;
    }
  };

  const getTraceBadgeColor = (type) => {
    switch (type) {
      case 'EVIDENCE_VERIFIED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ACTION_COMPLETED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'EVIDENCE_SUBMITTED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'EVIDENCE_REJECTED':
      case 'EVIDENCE_DELETED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Decision Trace Audit Log
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              100% explainable, deterministic record answering "Why did my intelligence status change?"
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trace List Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {traces.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium">No decision traces recorded yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Complete actions or upload evidence to populate your outcome decision log.
              </p>
            </div>
          ) : (
            traces.map((trace) => (
              <div
                key={trace.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      {getTraceIcon(trace.traceType)}
                    </div>
                    <span className="font-semibold text-white text-sm">
                      {trace.targetSkillName}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-medium ${getTraceBadgeColor(trace.traceType)}`}>
                      {trace.traceType}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {trace.createdAt ? new Date(trace.createdAt).toLocaleString() : 'Recent'}
                  </span>
                </div>

                <div className="flex items-center gap-2 my-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                    BEFORE: {trace.beforeState}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
                    AFTER: {trace.afterState}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-900">
                  {trace.explanation}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                  <span>Rule: <code className="text-slate-300 font-mono">{trace.ruleApplied}</code></span>
                  <span>Impact: <strong className="text-emerald-400 font-semibold">{trace.opportunityImpactCount} Opportunity(ies)</strong></span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Close Audit Log
          </button>
        </div>

      </div>
    </div>
  );
}

export default DecisionTraceModal;
