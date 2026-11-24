import React from 'react';
import { 
  Users, 
  Eye, 
  Code, 
  ShieldCheck, 
  CheckCircle2, 
  Check, 
  AlertCircle, 
  Compass 
} from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

/**
 * Candidate matches list with proof inspection, assessment review, and connection actions.
 */
export const CandidateMatchesSection = ({
  matches = [],
  onInspectEvidence,
  onViewAssessment,
  onViewDisclosedProfile,
  onOpenConnectModal
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Compass className="w-4 h-4 text-teal-700" />
          <span>Candidate Proof Recommendations ({matches.length})</span>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Traceable Evidence • Human Review Required
        </span>
      </div>

      {matches.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates discovered yet"
          description="Candidates will appear here as they demonstrate matching capability proof and complete technical assessments."
        />
      ) : (
        <div className="space-y-5">
          {matches.map((candidate) => (
            <div
              key={candidate.candidateAlias}
              className="bg-white border border-slate-200 hover:border-teal-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition duration-150 space-y-5"
            >
              {/* Card Header: Alias, Match count, and Readiness */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">Candidate #{candidate.candidateAlias}</h4>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                      {candidate.matchedRequiredSkillsCount} Required Skills Matched
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Anti-bias protected profile • Demonstrable technical footprint
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onInspectEvidence(candidate.candidateAlias)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 min-h-[44px]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Evidence</span>
                  </button>

                  <button
                    onClick={() => onViewAssessment(candidate)}
                    className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 min-h-[44px]"
                  >
                    <Code className="w-3.5 h-3.5 text-teal-700" />
                    <span>View Assessment</span>
                  </button>

                  {candidate.connectionStatus === 'ACCEPTED' ? (
                    <button
                      onClick={() => onViewDisclosedProfile(candidate.connectionId)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 min-h-[44px]"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>View Contact Info</span>
                    </button>
                  ) : candidate.connectionStatus === 'PENDING' ? (
                    <span className="px-3.5 py-2 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-xl min-h-[44px] flex items-center">
                      Request Pending
                    </span>
                  ) : (
                    <button
                      onClick={() => onOpenConnectModal(candidate)}
                      className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 min-h-[44px]"
                    >
                      <span>Move to Next Round</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Recommendation Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs">
                {/* Why This Candidate */}
                <div className="md:col-span-8 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5 text-emerald-800">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span>Why This Candidate? (Traceable Proof)</span>
                  </span>

                  <div className="space-y-1.5 text-slate-700">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Demonstrated core competencies across required tech stack.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Verified code project evidence submitted in portfolio.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Technical Screening: <strong>Eligible / Ready for Assessment Review</strong>.</span>
                    </div>
                  </div>
                </div>

                {/* Identified Gaps */}
                <div className="md:col-span-4 bg-amber-50/50 p-4 rounded-xl border border-amber-200/70 space-y-2">
                  <span className="font-bold text-amber-900 uppercase tracking-wider text-xs flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Competency Gaps</span>
                  </span>
                  <p className="text-amber-950 leading-relaxed text-xs">
                    Production deployment or CI/CD test evidence limited. Verify containerization or cloud exposure in interview.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
