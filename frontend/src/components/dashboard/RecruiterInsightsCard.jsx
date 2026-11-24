import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, ArrowRight } from 'lucide-react';

export const RecruiterInsightsCard = ({
  candidateCount = '2,847',
  growthPercent = '12%'
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Your Recruiter Insights
          </h3>
        </div>

        <Link
          to="/recruiter/opportunities"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
        >
          <span>View More</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Metric & Skyline Graphic */}
      <div className="relative pt-3 pb-2 z-10 flex items-end justify-between">
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
            {candidateCount}
          </div>
          <p className="text-xs font-medium text-slate-600">
            Candidates match your tech stack
          </p>
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-0.5">
            <span>↑ {growthPercent} vs last month</span>
          </div>
        </div>

        {/* Skyline Silhouette + Sparkline Chart Vector */}
        <div className="w-32 h-16 pointer-events-none relative">
          <svg viewBox="0 0 140 60" className="w-full h-full overflow-visible">
            {/* Skyline City Silhouette */}
            <path
              d="M10 60 L10 45 L20 45 L20 35 L30 35 L30 48 L45 48 L45 25 L55 25 L55 42 L70 42 L70 30 L85 30 L85 45 L95 45 L95 20 L105 20 L105 40 L120 40 L120 50 L135 50 L135 60 Z"
              fill="#DBEAFE"
              opacity="0.5"
            />
            {/* Glowing Trend Line */}
            <path
              d="M10 45 L35 32 L65 38 L95 20 L130 10"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Trend dots */}
            <circle cx="10" cy="45" r="3" fill="#2563EB" />
            <circle cx="35" cy="32" r="3" fill="#2563EB" />
            <circle cx="65" cy="38" r="3" fill="#2563EB" />
            <circle cx="95" cy="20" r="3" fill="#2563EB" />
            <circle cx="130" cy="10" r="3.5" fill="#1D4ED8" />
          </svg>
        </div>
      </div>

      {/* Bottom Button: Post an Opportunity → */}
      <div className="pt-2 relative z-10">
        <button
          type="button"
          onClick={() => navigate('/recruiter/opportunities/new')}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#0a1122] hover:bg-[#141f38] text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <span>Post an Opportunity</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
