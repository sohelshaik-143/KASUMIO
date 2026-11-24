import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight } from 'lucide-react';

export const RecommendedOpportunitiesCard = ({ opportunities = [] }) => {
  const navigate = useNavigate();

  const items = (opportunities || []).slice(0, 3).map((o) => ({
    id: o.id,
    title: o.title,
    orgName: o.organizationName || 'Tech Partner',
    badge1: o.type || 'Full-Time',
    badge2: o.workType || 'Remote',
    meta: o.whyRecommended || o.location || 'Active Role',
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Recommended Opportunities
          </h3>
        </div>

        <Link
          to="/student/discover"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Opportunities List or Clean Empty State */}
      {items.length === 0 ? (
        <div className="py-8 px-4 text-center space-y-2 my-auto">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-100">
            <Briefcase className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-700">
            No recommended opportunities yet
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            When recruiters publish active roles or challenges matching your verified skills, they will appear here.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/student/discover')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition"
            >
              <span>Explore Roles</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5 pt-3">
          {items.map((opp) => (
            <div
              key={opp.id}
              onClick={() => navigate('/student/discover')}
              className="flex items-center justify-between gap-3 p-2 hover:bg-slate-50/80 rounded-xl transition cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Company Initial */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/80 shadow-2xs overflow-hidden bg-blue-600 text-white font-extrabold text-xs">
                  {opp.orgName.slice(0, 2).toUpperCase()}
                </div>

                {/* Title & Badges */}
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                    {opp.title}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                      {opp.badge1}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {opp.badge2}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline truncate max-w-[140px]">
                      {opp.meta}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-600 text-slate-500 group-hover:text-white flex items-center justify-center shrink-0 transition">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
