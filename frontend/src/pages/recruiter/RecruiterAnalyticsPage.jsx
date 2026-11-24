import React from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle2, ArrowUpRight, Award, Zap } from 'lucide-react';

export const RecruiterAnalyticsPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Recruitment Intelligence & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Evidence-driven metrics, candidate discovery conversion rates, and skill leverage insights.
        </p>
      </div>

      {/* Funnel Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opportunity Views</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">12,540</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+20% this month</span>
          </span>
        </div>
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Qualified Applications</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">2,140</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18% conversion</span>
          </span>
        </div>
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proof-Verified Candidates</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">412</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+15% proof accuracy</span>
          </span>
        </div>
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Offers Accepted</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">18</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Zero fake mismatch</span>
          </span>
        </div>
      </div>

      {/* Top In-Demand Technologies in Company */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Most Demanded Technologies
          </h3>
          <div className="space-y-3 text-xs">
            {[
              { name: 'Java', count: '100% of backend roles', pct: 95 },
              { name: 'Spring Boot', count: '92% of backend roles', pct: 88 },
              { name: 'AWS Cloud', count: '75% of cloud roles', pct: 75 },
              { name: 'Docker / Microservices', count: '68% of infra roles', pct: 68 },
              { name: 'SQL & Database Indexing', count: '65% of engineering roles', pct: 65 }
            ].map((tech, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">{tech.name}</span>
                  <span className="text-slate-400">{tech.count}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${tech.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Hiring Speed & Verification Efficiency
          </h3>
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">
                Time-to-Shortlist Reduced by 64%
              </span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Because candidates submit verifiable GitHub code repositories and automated assessment attempts, resume keyword spam is eliminated.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-1">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                100% Deterministic Technical Signals
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Zero arbitrary AI readiness scores. Every candidate ranking is backed strictly by verified code artifacts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
