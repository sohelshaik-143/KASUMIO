import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Target, FileCode, Layers, TrendingUp } from 'lucide-react';

export function GraphicalProgressFlow({ visualFlow, outcomeData }) {
  if (!visualFlow) return null;

  const currentTech = visualFlow.currentTechStr || 'Starting Capability';
  const targetTech = visualFlow.gapTechStr || 'Target Technology';
  const actionTitle = visualFlow.flowActionTitle || 'Recommended Action';
  const evidenceExpected = visualFlow.expectedEvidenceStr || 'Verifiable Evidence';
  const targetOutcome = visualFlow.targetOutcomeStr || 'Opportunity Impact';

  const verifiedCount = outcomeData?.verifiedEvidenceCount || 0;
  const newlyMatchedCount = outcomeData?.newlyMatchedOpportunitiesCount || 0;

  const steps = [
    {
      id: '1',
      phase: 'BEFORE',
      title: currentTech,
      badge: 'Unverified / Gap',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: Layers,
      description: 'Initial state prior to action execution',
    },
    {
      id: '2',
      phase: 'ACTION',
      title: actionTitle,
      badge: 'In Progress / Done',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: Target,
      description: 'Targeted career growth step',
    },
    {
      id: '3',
      phase: 'EVIDENCE',
      title: evidenceExpected,
      badge: `${outcomeData?.totalEvidenceCount || 0} Artifact(s)`,
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      icon: FileCode,
      description: 'Factual repository or project artifact',
    },
    {
      id: '4',
      phase: 'VERIFICATION',
      title: verifiedCount > 0 ? `${verifiedCount} Verified` : 'Submitted for Verification',
      badge: verifiedCount > 0 ? 'Verified Partner' : 'Pending Verification',
      badgeColor: verifiedCount > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      icon: ShieldCheck,
      description: 'Attributed verification by organization',
    },
    {
      id: '5',
      phase: 'AFTER',
      title: `${targetTech} Verified`,
      badge: 'Demonstrated Strong',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: CheckCircle2,
      description: 'Strengthened capability level',
    },
    {
      id: '6',
      phase: 'OPPORTUNITY IMPACT',
      title: `${newlyMatchedCount} Opportunities Matched`,
      badge: 'Real Impact',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      icon: TrendingUp,
      description: targetOutcome,
    },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm my-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Evidence → Outcome Progression
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic, explainable path proving how completed actions and verified evidence improve real opportunity readiness.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Live Data Trace
        </span>
      </div>

      {/* Graphical Flow Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative group">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 h-full flex flex-col justify-between hover:border-slate-700 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                      Step 0{idx + 1}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${step.badgeColor}`}>
                      {step.phase}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 my-2">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
                      <Icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-white line-clamp-2 leading-tight">
                      {step.title}
                    </h4>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-900">
                  {step.description}
                </p>
              </div>

              {/* Arrow Connector for Desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GraphicalProgressFlow;
