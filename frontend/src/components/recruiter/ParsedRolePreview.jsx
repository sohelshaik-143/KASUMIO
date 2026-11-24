import React from 'react';
import { CheckCircle2, MapPin, Sparkles } from 'lucide-react';

export const ParsedRolePreview = ({
  parsedIntent,
  assessmentConfig,
  setAssessmentConfig,
}) => {
  if (!parsedIntent) return null;

  return (
    <div className="kasumo-card p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-paper-border pb-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-verified">
            Understood Intent & Structured Role
          </span>
          <h3 className="text-xl font-bold text-ink font-serif mt-1">
            {parsedIntent.roleTitle}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-verified-light text-verified border border-verified-border font-semibold uppercase">
            {parsedIntent.opportunityType}
          </span>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-paper-subtle text-ink-muted border border-paper-border font-semibold uppercase flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            {parsedIntent.workType} • {parsedIntent.location}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technology Requirements */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
            Technology Requirements (Taxonomy Resolved)
          </h4>
          <div>
            <span className="text-xs font-semibold text-verified block mb-1.5">
              Required Core Technologies:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {parsedIntent.requiredSkills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-verified-light text-verified border border-verified-border"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-verified" aria-hidden="true" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {parsedIntent.preferredSkills?.length > 0 && (
            <div className="mt-3">
              <span className="text-xs font-semibold text-ink-muted block mb-1.5">
                Preferred Technologies:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {parsedIntent.preferredSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-paper-subtle text-ink border border-paper-border"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Summary Preview */}
        <div className="space-y-2 bg-paper-subtle border border-paper-border rounded-xl p-4">
          <span className="text-xs font-bold text-ink uppercase tracking-wider block">
            Generated Role Summary & Responsibilities
          </span>
          <p className="text-xs text-ink-muted leading-relaxed line-clamp-4">
            {parsedIntent.generatedDescription}
          </p>
          <div className="pt-2 text-xs text-ink-subtle whitespace-pre-line line-clamp-3">
            {parsedIntent.generatedResponsibilities}
          </div>
        </div>
      </div>

      {/* Technical Screening Blueprint */}
      <div className="pt-4 border-t border-paper-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-verified" aria-hidden="true" />
            <span className="text-xs font-bold text-ink uppercase tracking-wider">
              Technical Screening Blueprint
            </span>
          </div>
          <label className="flex items-center gap-2 text-xs text-ink-muted cursor-pointer font-medium">
            <input
              type="checkbox"
              id="assessment-blueprint-active"
              checked={assessmentConfig.enabled}
              onChange={(e) => setAssessmentConfig({ ...assessmentConfig, enabled: e.target.checked })}
              className="w-4 h-4 rounded text-verified border-paper-border focus:ring-verified"
            />
            <span>Active for this role</span>
          </label>
        </div>

        {assessmentConfig.enabled && (
          <div className="bg-paper-subtle p-4 rounded-xl border border-paper-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label htmlFor="assessment-time-limit" className="font-semibold text-ink block mb-1">Time Limit:</label>
              <div className="flex items-center gap-2">
                <input
                  id="assessment-time-limit"
                  type="number"
                  min="15"
                  max="180"
                  value={assessmentConfig.timeLimit}
                  onChange={(e) => setAssessmentConfig({ ...assessmentConfig, timeLimit: parseInt(e.target.value) || 45 })}
                  className="w-20 bg-white border border-paper-border rounded-lg px-2.5 py-1 text-xs font-mono font-bold"
                />
                <span className="text-ink-muted">minutes</span>
              </div>
            </div>

            <div>
              <label htmlFor="assessment-passing-score" className="font-semibold text-ink block mb-1">Passing Threshold:</label>
              <div className="flex items-center gap-2">
                <input
                  id="assessment-passing-score"
                  type="number"
                  min="30"
                  max="100"
                  value={assessmentConfig.passingScore}
                  onChange={(e) => setAssessmentConfig({ ...assessmentConfig, passingScore: parseInt(e.target.value) || 70 })}
                  className="w-20 bg-white border border-paper-border rounded-lg px-2.5 py-1 text-xs font-mono font-bold"
                />
                <span className="text-ink-muted">% score</span>
              </div>
            </div>

            <div>
              <span className="font-semibold text-ink block mb-1">Curriculum:</span>
              <span className="text-xs text-ink-muted">
                Algorithmic challenges, multi-language sandbox, deterministic test suite.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParsedRolePreview;
