import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Terminal, 
  Clock, 
  Eye, 
  FileCode,
  Layers
} from 'lucide-react';

/**
 * AssessmentIntegritySignalsCard
 * Displays transparent, non-punitive assessment integrity telemetry (Principles #1, #2, #3, #11, #12).
 */
export const AssessmentIntegritySignalsCard = ({ 
  integrityStatus = 'NORMAL', 
  integritySignalsJson 
}) => {
  let signals = null;
  try {
    if (integritySignalsJson) {
      signals = typeof integritySignalsJson === 'string'
        ? JSON.parse(integritySignalsJson)
        : integritySignalsJson;
    }
  } catch (e) {
    console.error('Failed to parse integritySignalsJson', e);
  }

  const getStatusBadge = () => {
    switch (integrityStatus) {
      case 'STRONG_ANOMALY_PATTERN':
        return {
          label: 'Strong Anomaly Pattern',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500'
        };
      case 'REVIEW_RECOMMENDED':
        return {
          label: 'Review Recommended',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'MINOR_ANOMALY':
        return {
          label: 'Minor Anomaly Detected',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500'
        };
      case 'NORMAL':
      default:
        return {
          label: 'Normal Signals',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500'
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Assessment Integrity Telemetry</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Transparent Verification Signals
          </h3>
          <p className="text-xs text-slate-500">
            Telemetry is contextual evidence for human review—never treated as automatic cheating.
          </p>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold font-mono uppercase ${badge.bg}`}>
          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
          <span>{badge.label}</span>
        </div>
      </div>

      {/* Telemetry Metrics Row */}
      {signals && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Focus Changes
            </span>
            <span className="text-base font-bold font-mono text-slate-800">
              {signals.focusChangeCount ?? 0}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">blur events</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Paste Events
            </span>
            <span className="text-base font-bold font-mono text-slate-800">
              {signals.pasteCount ?? 0}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">editor inserts</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Fast Solves
            </span>
            <span className="text-base font-bold font-mono text-slate-800">
              {signals.fastSolveCount ?? 0}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">high proficiency</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Compilations
            </span>
            <span className="text-base font-bold font-mono text-slate-800">
              {signals.compilationErrors ?? 0} errs
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">sandbox runs</span>
          </div>
        </div>
      )}

      {/* Observations list */}
      {signals?.observations && signals.observations.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
            System Telemetry Observations:
          </span>
          <div className="space-y-1.5">
            {signals.observations.map((obs, idx) => (
              <div
                key={idx}
                className="p-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{obs}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Non-punitive assurance */}
      <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
        <strong>Fair Verification Guarantee:</strong> Fast solutions reflect technical proficiency, while occasional window changes are expected during development. Human recruiters review all contextual signals.
      </div>
    </div>
  );
};
