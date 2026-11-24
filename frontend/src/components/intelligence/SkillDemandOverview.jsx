import React from 'react';
import { BarChart3, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

export const SkillDemandOverview = ({
  intelligence,
  onModelWhatIf,
}) => {
  return (
    <div className="space-y-6">
      {/* Market Demand Rankings */}
      <div className="kasumo-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-paper-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-verified" aria-hidden="true" />
              <h2 className="text-xl font-bold text-ink font-serif">
                Market Technology Demand
              </h2>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Empirical frequency of technologies required across all published opportunities.
            </p>
          </div>
          <span className="text-xs font-mono text-ink-muted">
            {intelligence?.topDemandedTechnologies?.length || 0} technologies indexed
          </span>
        </div>

        {!intelligence?.topDemandedTechnologies?.length ? (
          <EmptyState
            icon={BarChart3}
            title="No Demand Data Available"
            description="Publish active opportunities with required skills to populate market technology demand."
          />
        ) : (
          <div className="space-y-4">
            {intelligence.topDemandedTechnologies.map((item, idx) => {
              const maxCount = intelligence.topDemandedTechnologies[0]?.opportunityCount || 1;
              const percentage = Math.round((item.opportunityCount / maxCount) * 100);

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">{item.technologyName}</span>
                      <span className="text-xs text-ink-muted">({item.category})</span>
                      {item.studentPossesses ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-verified-light text-verified border border-verified-border">
                          <CheckCircle2 className="w-3.5 h-3.5 text-verified" aria-hidden="true" />
                          <span>Possessed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-paper-subtle text-ink-muted border border-paper-border">
                          <span>Missing</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs tabular-nums">
                      <span className="text-verified font-bold">{item.opportunityCount} roles</span>
                      <span className="text-ink-muted text-xs">
                        ({item.requiredCount} req / {item.preferredCount} pref)
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-paper-subtle rounded-full h-2.5 overflow-hidden border border-paper-border">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        item.studentPossesses ? 'bg-verified' : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.max(6, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Skill Leverage Engine Table */}
      <div className="kasumo-card p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-paper-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-unverified" aria-hidden="true" />
              <h2 className="text-xl font-bold text-ink font-serif">
                Skill Leverage Engine
              </h2>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Identifies which missing capability unlocks the highest number of active opportunities.
            </p>
          </div>
        </div>

        {!intelligence?.highestLeverageSkills?.length ? (
          <EmptyState
            icon={Zap}
            title="All Demanded Technologies Covered"
            description="Your evidence portfolio covers all current actively demanded technologies."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Rank & Skill</th>
                  <th>Category</th>
                  <th className="text-center">Roles Unlocked</th>
                  <th>Strategic Rationale</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {intelligence.highestLeverageSkills.map((gap, i) => (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-2 font-semibold text-ink">
                        <span className="w-5 h-5 rounded-full bg-paper-subtle border border-paper-border text-xs font-mono flex items-center justify-center text-ink-muted font-bold">
                          {i + 1}
                        </span>
                        <span>{gap.skillName}</span>
                      </div>
                    </td>
                    <td className="text-ink-muted">{gap.category}</td>
                    <td className="text-center">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-unverified px-2.5 py-0.5 rounded-md bg-unverified-light border border-unverified-border tabular-nums">
                        +{gap.opportunitiesUnlockedCount}
                      </span>
                    </td>
                    <td className="text-ink-muted max-w-xs truncate">
                      {gap.rationale}
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => onModelWhatIf(gap.skillName)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-verified hover:text-verified-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified rounded"
                      >
                        <span>Model What-If</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillDemandOverview;
