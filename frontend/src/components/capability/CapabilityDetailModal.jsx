import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
  FileCode2,
  Briefcase
} from 'lucide-react';
import { Modal } from '../common/Modal';

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
    Strong: 'bg-teal-50 text-teal-800 border-teal-200 font-bold',
    Developing: 'bg-amber-50 text-amber-800 border-amber-200 font-bold',
    Learning: 'bg-slate-100 text-slate-800 border-slate-200 font-medium',
  }[capability.state || 'Developing'] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={capability.name}
      description={`Category: ${capability.category || 'Technology'}${
        capability.lastActivity ? ` • Last activity: ${capability.lastActivity}` : ''
      }`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        {/* Status indicator badge */}
        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1 rounded-full border ${statusBadge}`}>
            State: {capability.state || 'Developing'}
          </span>
        </div>

        {/* Confidence & Evidence Breakdown */}
        <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-700" aria-hidden="true" />
              <span>Evidence-Backed Capability Rating</span>
            </span>
            <span className="text-sm font-bold font-mono text-teal-950">
              {capability.confidence ? `${capability.confidence}%` : 'High Confidence'}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {capability.reasoning ||
              `Demonstrated competency supported by ${supportingEvidence.length} direct submission artifact(s). Matches active requirement taxonomies.`}
          </p>
        </div>

        {/* Supporting Evidence Portfolio List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-700" aria-hidden="true" />
            <span>Supporting Proof & Evidence Artifacts ({supportingEvidence.length})</span>
          </h3>

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
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-200 transition space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-teal-700" aria-hidden="true" />
                      <span className="font-bold text-slate-900">{ev.title}</span>
                      <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {ev.evidenceType}
                      </span>
                    </div>

                    {ev.verified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200">
                        <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
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
                      className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 pt-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
                    >
                      <span>Inspect Repository / Certificate</span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
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
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-teal-700" aria-hidden="true" />
              <span>Connected Market Opportunities ({relatedOpps.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {relatedOpps.slice(0, 4).map((opp) => (
                <div
                  key={opp.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-900 truncate">{opp.title}</p>
                    <p className="text-xs text-slate-500 truncate">{opp.organizationName}</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                    {opp.matchCategory || 'Match'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2"
        >
          Close Inspector
        </button>
      </div>
    </Modal>
  );
};

export default CapabilityDetailModal;
