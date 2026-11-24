import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export const WhatIfSimulator = ({
  simulatedSkill,
  setSimulatedSkill,
  simulating,
  onRunWhatIf,
  whatIfResult,
  catalog = [],
  highestLeverageSkills = [],
  onNavigateOpportunities,
  onNavigateAddEvidence,
}) => {
  return (
    <div className="space-y-6">
      {/* Simulation Controls */}
      <div className="kasumo-card p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-verified" aria-hidden="true" />
            <h2 className="text-xl font-bold text-ink font-serif tracking-tight">
              What-If Capability Simulation Engine
            </h2>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Simulate acquiring and verifying any technology to deterministically model your unlocked opportunities and match score increase.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <div className="flex-1">
            <label htmlFor="simulate-skill-input" className="sr-only">Technology to simulate</label>
            <input
              id="simulate-skill-input"
              type="text"
              list="catalog-technologies"
              placeholder="Select or type a technology (e.g., Docker, Kubernetes, AWS)..."
              value={simulatedSkill}
              onChange={(e) => setSimulatedSkill(e.target.value)}
              className="w-full bg-paper-subtle border border-paper-border rounded-lg px-4 py-2.5 text-xs text-ink placeholder-ink-subtle focus:outline-hidden focus:ring-2 focus:ring-verified focus:bg-white transition"
            />
            <datalist id="catalog-technologies">
              {catalog.map((cat, i) => (
                <option key={i} value={cat.name} />
              ))}
            </datalist>
          </div>

          <button
            type="button"
            onClick={() => onRunWhatIf(simulatedSkill)}
            disabled={simulating || !simulatedSkill.trim()}
            className="px-5 py-2.5 bg-verified hover:bg-verified-hover text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified focus-visible:ring-offset-2 shrink-0"
          >
            {simulating ? 'Modeling Market...' : 'Run Simulation'}
          </button>
        </div>

        {/* Quick Pick Highest Leverage Skills */}
        {highestLeverageSkills.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
            <span className="text-ink-muted font-medium">Quick Pick Highest ROI:</span>
            {highestLeverageSkills.slice(0, 5).map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSimulatedSkill(s.skillName);
                  onRunWhatIf(s.skillName);
                }}
                className="px-2.5 py-1 bg-paper-subtle hover:bg-paper-border border border-paper-border text-ink rounded-md transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified"
              >
                +{s.opportunitiesUnlockedCount} {s.skillName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Simulation Results Card */}
      {whatIfResult && (
        <div className="kasumo-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-border pb-4">
            <div>
              <span className="text-xs font-bold text-verified uppercase tracking-wider block">
                Simulation Projection
              </span>
              <h3 className="text-xl font-bold text-ink font-serif mt-1">
                Impact of Demonstrating {whatIfResult.simulatedSkillName}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-verified-light border border-verified-border rounded-lg px-4 py-2 text-center">
                <span className="text-xs text-verified font-medium block">Roles Unlocked</span>
                <span className="text-2xl font-bold font-serif text-verified tabular-nums">
                  +{whatIfResult.newlyUnlockedOpportunitiesCount}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-ink-muted leading-relaxed">
            {whatIfResult.projectedImpactSummary}
          </p>

          {/* Unlocked Roles Preview */}
          {whatIfResult.newlyUnlockedOpportunities?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                Opportunities Unlocked by this Evidence
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {whatIfResult.newlyUnlockedOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3.5 bg-paper-subtle border border-paper-border rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-ink">{opp.title}</p>
                      <p className="text-xs text-ink-muted">{opp.organizationName}</p>
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-verified-light text-verified border border-verified-border">
                      {opp.matchCategory}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-paper-border">
            <button
              type="button"
              onClick={onNavigateOpportunities}
              className="px-4 py-2 text-xs font-semibold text-ink hover:bg-paper-subtle border border-paper-border rounded-lg transition"
            >
              Browse All Opportunities
            </button>
            <button
              type="button"
              onClick={onNavigateAddEvidence}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-verified hover:bg-verified-hover text-white text-xs font-semibold rounded-lg shadow-xs transition"
            >
              <span>Add Proof for {whatIfResult.simulatedSkillName}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatIfSimulator;
