import React, { useState } from 'react';
import { ShieldCheck, FileCheck, Award, AlertTriangle, ArrowRight, Activity, Eye, CheckCircle2, Target } from 'lucide-react';
import GraphicalProgressFlow from './GraphicalProgressFlow';
import DecisionTraceModal from './DecisionTraceModal';

export function OutcomeIntelligenceSection({ outcomeData, onRecalculate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!outcomeData) return null;

  const {
    careerGoalTitle = 'Software Engineer',
    totalEvidenceCount = 0,
    verifiedEvidenceCount = 0,
    staleEvidenceCount = 0,
    completedActionsCount = 0,
    newlyMatchedOpportunitiesCount = 0,
    overallReadinessSummary = '',
    capabilityTransitions = [],
    recentTraces = [],
    visualFlow = null
  } = outcomeData;

  return (
    <section className="mt-8 space-y-6">
      {/* Overview Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Evidence → Outcome Intelligence
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Goal: <strong className="text-slate-200">{careerGoalTitle}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Demonstrated Capability & Opportunity Readiness
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {overallReadinessSummary || 'Proving how your real completed actions and verified evidence improve demonstrated capability and opportunity readiness.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-700"
            >
              <Eye className="w-4 h-4 text-emerald-400" />
              Decision Trace Log ({recentTraces.length})
            </button>
            {onRecalculate && (
              <button
                onClick={onRecalculate}
                className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-emerald-950/40"
              >
                <Activity className="w-4 h-4" />
                Recalculate Impact
              </button>
            )}
          </div>
        </div>

        {/* Key Intelligence Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              Evidence Portfolio
            </div>
            <div className="text-2xl font-bold text-white">{totalEvidenceCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Submitted project & skill artifacts
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Evidence
            </div>
            <div className="text-2xl font-bold text-emerald-400">{verifiedEvidenceCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Attributed by partner organizations
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              Actions Completed
            </div>
            <div className="text-2xl font-bold text-blue-400">{completedActionsCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Executed growth steps
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <Award className="w-4 h-4 text-amber-400" />
              Opportunities Matched
            </div>
            <div className="text-2xl font-bold text-amber-400">{newlyMatchedOpportunitiesCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Derived from verified capability
            </p>
          </div>
        </div>

        {/* Stale Evidence Alert if applicable */}
        {staleEvidenceCount > 0 && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>{staleEvidenceCount} evidence artifact(s)</strong> are over 180 days old without recent verification. Updating or re-verifying helps preserve maximum readiness confidence.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Graphical Flow Component */}
      <GraphicalProgressFlow visualFlow={visualFlow} outcomeData={outcomeData} />

      {/* Provenance & Capability Transitions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Capability Provenance & Transitions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Explainable record of how evidence directly drives technology capability changes.
            </p>
          </div>
        </div>

        {capabilityTransitions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No demonstrated capability transitions recorded yet. Complete recommended actions or submit evidence.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {capabilityTransitions.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{item.skillName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 font-mono">{item.beforeLevel}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {item.afterLevel}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-900">
                  <p className="font-medium text-slate-200">{item.explanation}</p>
                  {item.evidenceTitle && (
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/60">
                      <span className="truncate max-w-[220px]">Artifact: <strong className="text-slate-300">{item.evidenceTitle}</strong></span>
                      {item.isVerified ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Verified {item.verifierOrganization ? `by ${item.verifierOrganization}` : ''}
                        </span>
                      ) : (
                        <span className="text-slate-400">Demonstrated</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Trace Modal */}
      <DecisionTraceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        traces={recentTraces}
      />
    </section>
  );
}

export default OutcomeIntelligenceSection;
