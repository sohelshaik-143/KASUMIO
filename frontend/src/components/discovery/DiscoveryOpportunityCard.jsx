import React from 'react';
import {
  Building,
  Clock,
  MapPin,
  Bookmark,
  BookmarkCheck,
  Heart,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

/**
 * Opportunity card displaying company, match level, strong/missing skills, and actions.
 */
export const DiscoveryOpportunityCard = ({
  opportunity: opp,
  onInspect,
  onToggleSave,
  onExpressInterest
}) => {
  const supportedCount = opp.strongSkills?.length || 0;
  const gapCount = opp.missingSkills?.length || 0;
  const totalSpecs = supportedCount + gapCount || 5;

  return (
    <div className="bg-white border border-slate-200 hover:border-teal-300 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5 transition group">
      {/* Top Row: Match Category + Company + Work Type + Bookmark */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3 py-1 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-extrabold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>
              {opp.matchCategory === 'STRONG' ? 'Strong Match' : opp.matchCategory === 'GOOD' ? 'Good Match' : 'Potential Match'}
            </span>
            <span className="text-xs font-normal text-teal-600 ml-1">
              ({supportedCount}/{totalSpecs} core requirements supported)
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            {opp.organizationName}
          </span>

          <span className="text-xs font-mono px-2 py-1 rounded bg-slate-50 text-slate-600 border border-slate-200">
            {opp.type} • {opp.workType}
          </span>

          {opp.deadline && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{opp.deadlineNote || opp.deadline}</span>
            </span>
          )}
        </div>

        {/* Bookmark Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onToggleSave(opp.id, opp.isSaved)}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition min-h-[44px] min-w-[44px] justify-center ${
              opp.isSaved
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
            title={opp.isSaved ? 'Bookmarked' : 'Save opportunity'}
            aria-label={opp.isSaved ? 'Remove bookmark' : 'Bookmark opportunity'}
          >
            {opp.isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-teal-700" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Opportunity Title & Details */}
      <div>
        <h2
          onClick={() => onInspect(opp.id)}
          className="text-xl font-bold text-slate-900 tracking-tight cursor-pointer hover:text-teal-700 transition font-serif"
        >
          {opp.title}
        </h2>

        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
          {opp.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {opp.location}
            </span>
          )}
          {opp.compensation && (
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              {opp.compensation}
            </span>
          )}
          {opp.duration && (
            <span className="text-slate-400 font-medium">• {opp.duration}</span>
          )}
        </div>
      </div>

      {/* Explainable Why Recommended Highlight */}
      {opp.whyRecommended && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block mb-1">
            Why KASUMIO Recommends This
          </span>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {opp.whyRecommended}
          </p>
        </div>
      )}

      {/* Capability Footprint Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {opp.strongSkills && opp.strongSkills.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider mr-1">
              Demonstrated:
            </span>
            {opp.strongSkills.map((s, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {s}
              </span>
            ))}
          </div>
        )}

        {opp.missingSkills && opp.missingSkills.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap ml-auto">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider mr-1">
              Skill Gaps:
            </span>
            {opp.missingSkills.map((s, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium"
              >
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Source: <span className="text-slate-600 font-medium">{opp.verificationStatus || 'Verified Partner'}</span>
        </div>

        <div className="flex items-center gap-3">
          {opp.hasExpressedInterest ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 min-h-[44px]">
              <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
              <span>Interest Expressed</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onExpressInterest(opp.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition min-h-[44px]"
            >
              <Heart className="w-3.5 h-3.5 text-rose-600" />
              <span>Express Interest</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onInspect(opp.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition min-h-[44px]"
          >
            <span>Inspect Match Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
