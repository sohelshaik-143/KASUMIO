import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Building, Clock, CheckCircle, AlertTriangle, ArrowRight, Compass } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

/**
 * Recommended Opportunities List displaying explainable matching criteria and technology gaps.
 */
export const RecommendedOpportunitiesList = ({ recommendations = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Recommended Opportunities
          </h2>
          <p className="text-xs text-slate-500">
            Matched strictly to your verified skills and capability footprint.
          </p>
        </div>
        <Link
          to="/student/discover"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          <span>Explore All Roles</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recommendations.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No opportunities found"
          description="Explore our opportunity market to discover open engineering, research, and technical roles."
          actionText="Discover Roles"
          onAction={() => navigate('/student/discover')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {recommendations.slice(0, 3).map((opp) => {
            const supportedCount = opp.strongSkills?.length || 0;
            const gapCount = opp.missingSkills?.length || 0;
            const totalSpecs = supportedCount + gapCount || 5;

            return (
              <div
                key={opp.id}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition group"
              >
                {/* Top Row: Match Level + Company + Work Mode + Deadline */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-extrabold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        {opp.matchCategory === 'STRONG' ? 'Strong Match' : opp.matchCategory === 'GOOD' ? 'Good Match' : 'Potential Match'}
                      </span>
                      <span className="text-[10px] font-normal text-indigo-500 ml-1">
                        ({supportedCount}/{totalSpecs} core requirements supported)
                      </span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      {opp.organizationName}
                    </span>

                    <span className="text-xs font-mono px-2 py-1 rounded bg-slate-50 text-slate-600 border border-slate-200">
                      {opp.type} • {opp.workType}
                    </span>
                  </div>

                  {opp.deadline && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-medium bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{opp.deadlineNote || opp.deadline}</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <div>
                  <h3
                    onClick={() => navigate(`/student/discover/${opp.id}`)}
                    className="text-lg font-bold text-slate-900 cursor-pointer hover:text-indigo-600 transition"
                  >
                    {opp.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Location: <span className="text-slate-700 font-medium">{opp.location || 'Remote'}</span>
                    {opp.compensation && ` • Compensation: ${opp.compensation}`}
                  </p>
                </div>

                {/* Explainable Why It Matches Highlight */}
                {opp.whyRecommended && (
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 text-xs">
                    <span className="font-bold text-indigo-900 block mb-0.5">Why this matches:</span>
                    <p className="text-slate-700 leading-relaxed">{opp.whyRecommended}</p>
                  </div>
                )}

                {/* Supported Specs & Missing Gap Chips */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                  {opp.strongSkills?.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-emerald-700 text-[11px] uppercase tracking-wider">Supported:</span>
                      {opp.strongSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"
                        >
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {opp.missingSkills?.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-amber-700 text-[11px] uppercase tracking-wider">Missing Gap:</span>
                      {opp.missingSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Link */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">Deterministic Matcher</span>
                  <button
                    onClick={() => navigate(`/student/discover/${opp.id}`)}
                    className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    <span>View Match Breakdown & Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
