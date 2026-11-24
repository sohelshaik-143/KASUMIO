import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight } from 'lucide-react';

export const RecommendedOpportunitiesCard = ({ opportunities = [] }) => {
  const navigate = useNavigate();

  const defaultItems = [
    {
      id: 'opp-tcs',
      logoType: 'tcs',
      title: 'TCS NQT 2026',
      badge1: 'Full-Time',
      badge2: 'Off-Campus',
      meta: '2 days ago • 4.2L+ students applied',
    },
    {
      id: 'opp-msft',
      logoType: 'msft',
      title: 'Microsoft Software Engineer Intern',
      badge1: 'Internship',
      badge2: 'Remote',
      meta: '3 days ago • Top 1% match',
    },
    {
      id: 'opp-goog',
      logoType: 'goog',
      title: 'Google STEP Internship',
      badge1: 'Internship',
      badge2: 'Hybrid',
      meta: '5 days ago • 95% match',
    },
  ];

  const items = opportunities.length >= 3
    ? opportunities.slice(0, 3).map((o, idx) => ({
        id: o.id,
        logoType: idx === 0 ? 'tcs' : idx === 1 ? 'msft' : 'goog',
        title: o.title,
        badge1: o.type || 'Full-Time',
        badge2: o.workType || 'Remote',
        meta: o.whyRecommended || 'Top Match',
      }))
    : defaultItems;

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

      {/* Opportunities List */}
      <div className="space-y-3.5 pt-3">
        {items.map((opp) => (
          <div
            key={opp.id}
            onClick={() => navigate('/student/discover')}
            className="flex items-center justify-between gap-3 p-2 hover:bg-slate-50/80 rounded-xl transition cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Company Logo Icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/80 shadow-2xs overflow-hidden bg-white">
                {opp.logoType === 'tcs' && (
                  <div className="w-full h-full bg-[#003873] text-white font-extrabold text-[11px] flex items-center justify-center tracking-tighter">
                    TCS
                  </div>
                )}
                {opp.logoType === 'msft' && (
                  <div className="grid grid-cols-2 gap-0.5 p-2 w-full h-full">
                    <div className="bg-[#F25022] rounded-[1px]" />
                    <div className="bg-[#7FBA00] rounded-[1px]" />
                    <div className="bg-[#00A4EF] rounded-[1px]" />
                    <div className="bg-[#FFB900] rounded-[1px]" />
                  </div>
                )}
                {opp.logoType === 'goog' && (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.14z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.26A11.96 11.96 0 000 12c0 1.92.45 3.74 1.26 5.42l4.06-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.06 3.15c.94-2.83 3.58-4.98 6.68-4.98z"/>
                  </svg>
                )}
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
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                    {opp.badge2}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">
                  {opp.meta}
                </p>
              </div>
            </div>

            {/* Circular Action Arrow */}
            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-600 text-slate-500 group-hover:text-white flex items-center justify-center shrink-0 transition">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
