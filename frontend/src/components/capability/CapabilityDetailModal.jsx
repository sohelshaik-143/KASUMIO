import React from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  FileCode2,
  Briefcase
} from 'lucide-react';

export const CapabilityDetailModal = ({
  isOpen,
  onClose,
  capability,
  evidenceList = [],
  opportunities = []
}) => {
  if (!isOpen || !capability) return null;

  // Filter evidence related to this capability/skill
  const supportingEvidence = evidenceList.filter(
    (e) =>
      e.skillId === capability.id ||
      e.skillName?.toLowerCase() === capability.name?.toLowerCase()
  );

  // Filter opportunities requiring this capability
  const relatedOpps = opportunities.filter((o) => {
    const strongMatch = o.strongSkills?.some(
      (s) => s.toLowerCase() === capability.name?.toLowerCase()
    );
    const missingMatch = o.missingSkills?.some(
      (s) => s.toLowerCase() === capability.name?.toLowerCase()
    );
    return strongMatch || missingMatch;
  });

  const statusBadge = {
    Strong: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    Developing: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold',
    Learning: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
  }[capability.state || 'Developing'] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 my-auto">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {capability.name}
                </h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border ${statusBadge}`}>
                  {capability.state || 'Developing'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Category: <span className="font-medium text-slate-700">{capability.category || 'Technology'}</span>
                {capability.lastActivity && ` • Last activity: ${capability.lastActivity}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Confidence & Evidence Breakdown Summary */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Evidence-Backed Capability Rating</span>
              </span>
              <span className="text-sm font-extrabold font-mono text-indigo-700">
                {capability.confidence ? `${capability.confidence}%` : 'High Confidence'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {capability.reasoning ||
                `Demonstrated competency supported by ${supportingEvidence.length} direct submission artifact(s). Matches active requirement taxonomies.`}
            </p>
          </div>

          {/* Supporting Evidence Portfolio List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Supporting Proof & Evidence Artifacts ({supportingEvidence.length})</span>
              </h4>
            </div>

            {supportingEvidence.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-xs text-slate-500">
                  No direct evidence uploaded for {capability.name} yet. Submit a project or GitHub repository to raise your capability rating to Strong.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {supportingEvidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileCode2 className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-slate-900">{ev.title}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {ev.evidenceType}
                        </span>
                      </div>

                      {ev.verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Submitted</span>
                        </span>
                      )}
                    </div>

                    {ev.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>
                    )}

                    {ev.evidenceUrl && (
                      <a
                        href={ev.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 pt-1"
                      >
                        <span>Inspect Repository / Certificate</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Impact on Opportunities */}
          {relatedOpps.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Connected Market Opportunities ({relatedOpps.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {relatedOpps.slice(0, 4).map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 truncate">{opp.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{opp.organizationName}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {opp.matchCategory || 'Match'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
