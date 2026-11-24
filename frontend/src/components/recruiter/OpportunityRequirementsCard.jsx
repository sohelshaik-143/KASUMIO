import React from 'react';
import { 
  Layers, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Code, 
  Cpu 
} from 'lucide-react';

/**
 * Renders the opportunity overview, skill requirements, and technical screening blueprint.
 */
export const OpportunityRequirementsCard = ({
  opportunity,
  assessment,
  actionLoading,
  onPublish,
  onClose
}) => {
  if (!opportunity) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 uppercase font-semibold">
              {opportunity.type} • {opportunity.workType}
            </span>
            {opportunity.status === 'PUBLISHED' && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                PUBLISHED
              </span>
            )}
            {opportunity.status === 'DRAFT' && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3 h-3 text-amber-600" />
                DRAFT
              </span>
            )}
            {opportunity.status === 'CLOSED' && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                <XCircle className="w-3 h-3 text-slate-400" />
                CLOSED
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            {opportunity.title}
          </h1>

          {opportunity.location && (
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{opportunity.location}</span>
            </p>
          )}
        </div>

        {/* Recruiter Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {opportunity.status === 'DRAFT' && (
            <button
              disabled={actionLoading}
              onClick={onPublish}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50 min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Opportunity</span>
            </button>
          )}

          {opportunity.status === 'PUBLISHED' && (
            <button
              disabled={actionLoading}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition disabled:opacity-50 min-h-[44px]"
            >
              <XCircle className="w-4 h-4" />
              <span>Close Opportunity</span>
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
        {opportunity.description}
      </p>

      {/* Skill Requirements Summary */}
      <div className="pt-2 space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-700" />
          <span>Capability Requirements</span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {opportunity.skills?.map((s) => (
            <span
              key={s.skillId}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl border font-medium ${
                s.skillType === 'REQUIRED'
                  ? 'bg-teal-50 text-teal-800 border-teal-200 font-bold'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span>{s.skillName}</span>
              <span className="text-xs uppercase opacity-75 font-mono">({s.skillType})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Round-1 Technical Screening Blueprint */}
      {assessment && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <span>Technical Screening Blueprint</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">
              Passing Threshold: <strong className="text-emerald-600">{assessment.passingScore}%</strong> • Time Limit: <strong>{assessment.timeLimitMinutes} mins</strong>
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-600 font-medium mr-1">Screening Curriculum:</span>
            {assessment.questions?.map((q, idx) => (
              <span
                key={idx}
                className="text-xs font-mono bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 flex items-center gap-1.5 shadow-2xs"
              >
                {q.questionType === 'CODING' && <Code className="w-3 h-3 text-teal-700" />}
                {q.questionType === 'DEBUGGING' && <Cpu className="w-3 h-3 text-amber-600" />}
                {q.questionType === 'SQL' && <Layers className="w-3 h-3 text-emerald-600" />}
                <span>{q.title}</span>
                <span className="text-xs font-bold text-slate-400">({q.points}pts)</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
