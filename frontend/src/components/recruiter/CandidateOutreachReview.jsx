import React from 'react';
import { Users, CheckSquare, Square, AlertCircle, Sparkles, Edit3 } from 'lucide-react';

export const CandidateOutreachReview = ({
  recommendations = [],
  totalCandidatesScanned = 0,
  candidatesMatchedCount = 0,
  selectedAliases = [],
  toggleSelectCandidate,
  toggleSelectAll,
  customNotes = {},
  editingNotes = {},
  setEditingNotes,
  updateCustomNote,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h3 className="text-base font-bold text-ink flex items-center gap-2 font-serif">
            <Users className="w-4 h-4 text-verified" aria-hidden="true" />
            <span>Evidence-First Shortlisted Candidates ({recommendations.length})</span>
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Scanned {totalCandidatesScanned} candidates. Surfaced {candidatesMatchedCount} matching profiles strictly from demonstrable code artifacts.
          </p>
        </div>

        {recommendations.length > 0 && (
          <button
            type="button"
            onClick={toggleSelectAll}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-verified hover:text-verified-hover self-start sm:self-auto focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified rounded"
          >
            {selectedAliases.length === recommendations.length ? (
              <>
                <CheckSquare className="w-4 h-4" aria-hidden="true" />
                <span>Deselect All</span>
              </>
            ) : (
              <>
                <Square className="w-4 h-4" aria-hidden="true" />
                <span>Select All ({recommendations.length})</span>
              </>
            )}
          </button>
        )}
      </div>

      {recommendations.length === 0 ? (
        <div className="kasumo-card p-8 text-center">
          <AlertCircle className="w-8 h-8 text-ink-subtle mx-auto mb-2" aria-hidden="true" />
          <h4 className="text-sm font-bold text-ink">No candidates met the threshold</h4>
          <p className="text-xs text-ink-muted mt-1 max-w-md mx-auto">
            Try lowering the readiness threshold slider (e.g. to 40%) or expanding your required skills to discover more candidates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {recommendations.map((cand) => {
            const isSelected = selectedAliases.includes(cand.candidateAlias);
            const isEditingNote = editingNotes[cand.candidateAlias];

            return (
              <div
                key={cand.candidateAlias}
                className={`kasumo-card p-5 transition ${
                  isSelected ? 'border-verified' : 'opacity-80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Candidate Identity & Scores */}
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSelectCandidate(cand.candidateAlias)}
                      aria-label={`Select candidate ${cand.candidateAlias}`}
                      className="mt-1 text-ink-muted hover:text-verified transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified rounded"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-verified" aria-hidden="true" />
                      ) : (
                        <Square className="w-5 h-5 text-ink-subtle" aria-hidden="true" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-ink bg-paper-subtle px-2 py-0.5 rounded-md border border-paper-border">
                          {cand.candidateAlias}
                        </span>
                        <span className="text-xs font-semibold text-ink-muted uppercase">
                          Anonymous Candidate
                        </span>
                      </div>

                      {/* Why Recommended */}
                      <div className="mt-2 bg-paper-subtle border border-paper-border rounded-lg p-3 text-xs text-ink max-w-xl">
                        <span className="font-bold text-ink flex items-center gap-1 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-verified" aria-hidden="true" />
                          <span>Matching Rationale:</span>
                        </span>
                        <p className="leading-relaxed text-xs text-ink-muted">{cand.whyRecommended}</p>
                      </div>

                      {/* Matched Evidence Artifacts */}
                      {cand.matchedEvidenceList?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {cand.matchedEvidenceList.map((ev, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded bg-white border border-paper-border text-ink-muted font-mono"
                            >
                              ✓ {ev.skillName}: {ev.evidenceTitle}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Readiness Score & Action */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="bg-verified-light border border-verified-border rounded-lg px-4 py-2 text-right">
                      <span className="text-xs uppercase font-bold text-verified block">
                        Day-1 Readiness
                      </span>
                      <span className="text-2xl font-bold font-serif text-verified tabular-nums">
                        {cand.readinessScore}%
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingNotes((prev) => ({
                          ...prev,
                          [cand.candidateAlias]: !isEditingNote,
                        }))
                      }
                      className="text-xs text-verified hover:text-verified-hover font-semibold flex items-center gap-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified rounded"
                    >
                      <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{isEditingNote ? 'Hide Message' : 'Edit Outreach Message'}</span>
                    </button>
                  </div>
                </div>

                {/* Editable Outreach Message */}
                {isEditingNote && (
                  <div className="mt-4 pt-3 border-t border-paper-border space-y-1.5">
                    <label htmlFor={`custom-note-${cand.candidateAlias}`} className="text-xs font-bold text-ink uppercase tracking-wider block">
                      Customized Message to Candidate:
                    </label>
                    <textarea
                      id={`custom-note-${cand.candidateAlias}`}
                      rows={2}
                      value={customNotes[cand.candidateAlias] || ''}
                      onChange={(e) => updateCustomNote(cand.candidateAlias, e.target.value)}
                      className="w-full bg-white border border-paper-border rounded-lg p-2.5 text-xs text-ink focus:outline-hidden focus:ring-2 focus:ring-verified"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CandidateOutreachReview;
