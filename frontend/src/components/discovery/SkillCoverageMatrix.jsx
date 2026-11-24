import React from 'react';
import {
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MinusCircle
} from 'lucide-react';

/**
 * Skill & Evidence Coverage Matrix displaying requirement evaluations and eligibility.
 */
export const SkillCoverageMatrix = ({ opportunity: opp }) => {
  if (!opp) return null;

  return (
    <div className="space-y-6">
      {/* Structured Requirements & Eligibility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Eligibility Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Eligibility Assessment</span>
          </div>
          <div className="flex items-start gap-2.5 pt-1">
            {opp.eligible ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-semibold text-slate-900">
                {opp.eligible ? 'Candidate Eligible' : 'Eligibility Criteria Mismatch'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {opp.eligibilityReason}
              </p>
            </div>
          </div>
        </div>

        {/* Experience Requirements */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Experience Expectation
          </span>
          <p className="text-xs text-slate-800 font-medium">
            {opp.experienceRequirements || 'Open to all verified levels'}
          </p>
        </div>

        {/* Education Requirements */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Education Criteria
          </span>
          <p className="text-xs text-slate-800 font-medium">
            {opp.educationRequirements || 'Undergraduate or equivalent'}
          </p>
        </div>
      </div>

      {/* Skill & Evidence Coverage Matrix */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 font-serif">
            <Layers className="w-5 h-5 text-teal-700" />
            <span>Skill & Evidence Coverage Matrix</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Traceable mapping between opportunity requirements and your demonstrable portfolio evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opp.skillEvaluations && opp.skillEvaluations.map((skill) => (
            <div
              key={skill.skillId}
              className={`p-4 rounded-2xl border text-xs space-y-2 transition ${
                skill.matchStatus === 'MATCHED'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : skill.matchStatus === 'PARTIAL'
                  ? 'bg-teal-50/50 border-teal-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {skill.matchStatus === 'MATCHED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : skill.matchStatus === 'PARTIAL' ? (
                    <AlertCircle className="w-4 h-4 text-teal-700 shrink-0" />
                  ) : (
                    <MinusCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-bold text-slate-900 text-sm">{skill.skillName}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {skill.requirementType?.toLowerCase()}
                  </span>
                  {skill.verified && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <p className="text-slate-600 text-xs leading-relaxed">
                {skill.explanation}
              </p>

              <div className="flex items-center justify-between pt-1 text-xs text-slate-400 border-t border-slate-100">
                <span>Category: {skill.category}</span>
                {skill.ecosystem && <span>Ecosystem: {skill.ecosystem}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
