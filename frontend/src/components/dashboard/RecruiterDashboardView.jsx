import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Send,
  Briefcase,
  Plus,
  ArrowRight,
  TrendingUp,
  MoreVertical,
  Code,
  Trophy,
  Check,
  ChevronDown,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';

export const RecruiterDashboardView = ({
  user,
  opportunities = [],
  candidates = [],
  recentEvidence = [],
  connections = [],
  greeting = 'Good Morning'
}) => {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last 30 Days');
  const [invitedCandidateId, setInvitedCandidateId] = useState(null);

  const recruiterName = user?.fullName || 'Arjun';
  const firstName = recruiterName.split(' ')[0];

  // Derive dynamic shortlisted count from localStorage
  const shortlistedMap = (() => {
    try {
      const saved = localStorage.getItem('kasumo_shortlisted_ids');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  })();
  const shortlistedCount = Object.values(shortlistedMap).filter(Boolean).length;

  // Real database metrics - clean 0 defaults
  const totalCandidatesCount = candidates.length;
  const totalApplicationsCount = opportunities.reduce((acc, curr) => acc + (curr.applicationsCount || 0), 0);
  const hiredCount = connections.filter((c) => c.status === 'ACCEPTED').length;
  const totalPublishedOpportunities = opportunities.filter((o) => o.status === 'PUBLISHED').length;

  const handleInvite = (candidateId) => {
    setInvitedCandidateId(candidateId);
    setTimeout(() => {
      setInvitedCandidateId(null);
    }, 2500);
  };

  const displayOpportunities = opportunities.slice(0, 3);
  const displayCandidates = candidates.slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Header Welcome & Post Opportunity CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Welcome back, {firstName}!</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Find the right talent, build something great together.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/recruiter/opportunities/new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0a1224] dark:bg-blue-600 hover:bg-[#142345] dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition hover:shadow-md"
        >
          <span>Post a New Opportunity</span>
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Four Key Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Candidates */}
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>{totalCandidatesCount > 0 ? '+100%' : '0%'}</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
              {totalCandidatesCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Total Candidates
            </div>
          </div>
        </div>

        {/* Shortlisted */}
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>{shortlistedCount > 0 ? '+100%' : '0%'}</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
              {shortlistedCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Shortlisted
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>{totalApplicationsCount > 0 ? '+100%' : '0%'}</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
              {totalApplicationsCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Applications
            </div>
          </div>
        </div>

        {/* Hired */}
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>{hiredCount > 0 ? '+100%' : '0%'}</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
              {hiredCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Hired
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Layout Split: Left (65%) & Right (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (8 cols): Candidates Table & Two Info Cards */}
        <div className="lg:col-span-8 space-y-5">
          {/* Top Recommended Candidates Card */}
          <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Top Recommended Candidates
              </h3>
              <Link
                to="/recruiter/candidates"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {displayCandidates.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No candidate profiles recorded yet
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                  When student candidates submit demonstrable proof and verified evidence, honest matches will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-3">Candidate</th>
                      <th className="py-3 px-3">Skills / University</th>
                      <th className="py-3 px-3">Graduation</th>
                      <th className="py-3 px-3 text-center">Match</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {displayCandidates.map((cand, idx) => {
                      const matchPct = 95 - idx * 2;
                      return (
                        <tr
                          key={cand.id || idx}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group"
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                                {cand.fullName ? cand.fullName.slice(0, 2).toUpperCase() : 'ST'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                                  {cand.fullName || 'Student Candidate'}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">
                                  {cand.university || 'Registered Student'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="text-[11px] text-slate-600 dark:text-slate-300">
                              {cand.bio || 'Demonstrable engineering evidence'}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                            {cand.graduationYear || '2026'}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <div className="inline-flex items-center justify-center gap-1.5">
                              <div className="relative w-7 h-7 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                  <path
                                    className="text-slate-100 dark:text-slate-800"
                                    strokeWidth="3.5"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                  <path
                                    className="text-emerald-500"
                                    strokeDasharray={`${matchPct}, 100`}
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  />
                                </svg>
                                <span className="absolute text-[8px] font-bold text-slate-700 dark:text-slate-200">
                                  {matchPct}%
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <button
                                type="button"
                                onClick={() => handleInvite(cand.id || idx)}
                                disabled={invitedCandidateId === (cand.id || idx)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1 ${
                                  invitedCandidateId === (cand.id || idx)
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                              >
                                {invitedCandidateId === (cand.id || idx) ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Invited</span>
                                  </>
                                ) : (
                                  <span>Invite</span>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bottom Two Split Cards: Active Opportunities & Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Active Opportunities */}
            <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Active Opportunities
                  </h4>
                  <Link
                    to="/recruiter/opportunities"
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {displayOpportunities.length === 0 ? (
                  <div className="py-8 px-3 text-center space-y-2">
                    <Briefcase className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      No active opportunities
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Click "+ Post a New Opportunity" above to create your first role.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayOpportunities.map((opp, idx) => (
                      <div
                        key={opp.id || idx}
                        onClick={() => navigate(opp.id ? `/recruiter/opportunities/${opp.id}` : '/recruiter/opportunities')}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {opp.title}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {opp.location || 'Remote'} • {opp.type || 'Full Time'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 mb-0.5">
                            {opp.status || 'Active'}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                            {opp.applicationsCount || 0} Applications
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Recent Activity
                  </h4>
                  <Link
                    to="/recruiter/applications"
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {recentEvidence.length === 0 && connections.length === 0 ? (
                  <div className="py-8 px-3 text-center space-y-2">
                    <CheckCircle2 className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      No recent recruitment activity
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Actions and candidate submissions will appear in this timeline.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentEvidence.slice(0, 3).map((ev, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {ev.title || 'Candidate proof submitted for review'}
                            </p>
                            <p className="text-[10px] text-slate-400">Recent</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Job Post Performance Chart & Promo Banner */}
        <div className="lg:col-span-4 space-y-5">
          {/* Job Post Performance Card with Smooth SVG Chart */}
          <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Job Post Performance
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold cursor-pointer">
                <span>{selectedTimeframe}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 py-4 border-b border-slate-100 dark:border-slate-800 text-center">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Views</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {totalPublishedOpportunities > 0 ? `${totalPublishedOpportunities * 12}K` : '0'}
                </p>
                <span className="text-[10px] font-bold text-slate-400">
                  {totalPublishedOpportunities > 0 ? '↑ 15%' : '0%'}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Applications</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {totalApplicationsCount}
                </p>
                <span className="text-[10px] font-bold text-slate-400">
                  {totalApplicationsCount > 0 ? '↑ 10%' : '0%'}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Shortlisted</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {shortlistedCount}
                </p>
                <span className="text-[10px] font-bold text-slate-400">
                  {shortlistedCount > 0 ? '↑ 5%' : '0%'}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-5 pt-3 pb-1 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                <span>Views</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 dark:bg-purple-400" />
                <span>Applications</span>
              </div>
            </div>

            {/* Curved SVG Area Chart */}
            <div className="h-44 w-full pt-2">
              <svg viewBox="0 0 320 140" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="blueLineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="purpleLineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="0" y1="30" x2="320" y2="30" stroke="#94a3b8" strokeOpacity="0.1" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="320" y2="70" stroke="#94a3b8" strokeOpacity="0.1" strokeDasharray="3 3" />
                <line x1="0" y1="110" x2="320" y2="110" stroke="#94a3b8" strokeOpacity="0.1" strokeDasharray="3 3" />

                {/* Blue Area & Curve */}
                <path
                  d={totalPublishedOpportunities > 0
                    ? "M 10 95 C 40 90, 70 60, 110 50 C 150 40, 180 80, 220 55 C 260 30, 290 40, 310 48 L 310 130 L 10 130 Z"
                    : "M 10 120 L 310 120 L 310 130 L 10 130 Z"
                  }
                  fill="url(#blueLineGrad)"
                />
                <path
                  d={totalPublishedOpportunities > 0
                    ? "M 10 95 C 40 90, 70 60, 110 50 C 150 40, 180 80, 220 55 C 260 30, 290 40, 310 48"
                    : "M 10 120 L 310 120"
                  }
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                />

                {/* Purple Area & Curve */}
                <path
                  d={totalApplicationsCount > 0
                    ? "M 10 115 C 40 110, 70 95, 110 88 C 150 80, 180 100, 220 80 C 260 65, 290 75, 310 72 L 310 130 L 10 130 Z"
                    : "M 10 125 L 310 125 L 310 130 L 10 130 Z"
                  }
                  fill="url(#purpleLineGrad)"
                />
                <path
                  d={totalApplicationsCount > 0
                    ? "M 10 115 C 40 110, 70 95, 110 88 C 150 80, 180 100, 220 80 C 260 65, 290 75, 310 72"
                    : "M 10 125 L 310 125"
                  }
                  fill="none"
                  stroke="#9333ea"
                  strokeWidth="2.5"
                />

                {/* X Axis Date Labels */}
                <text x="10" y="138" fill="#94a3b8" fontSize="9" fontWeight="600">30d ago</text>
                <text x="105" y="138" fill="#94a3b8" fontSize="9" fontWeight="600">20d ago</text>
                <text x="210" y="138" fill="#94a3b8" fontSize="9" fontWeight="600">10d ago</text>
                <text x="290" y="138" fill="#94a3b8" fontSize="9" fontWeight="600">Today</text>
              </svg>
            </div>
          </div>

          {/* Dark Promo Card matching bottom right reference */}
          <div className="relative rounded-2xl p-5 bg-[#080d19] border border-[#16213b] text-white shadow-lg overflow-hidden flex flex-col justify-between min-h-[170px]">
            <div className="space-y-2 z-10 max-w-[210px]">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-extrabold text-white leading-snug">
                Find the Right Talent with KASUMO
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Leverage verified skills and real project evidence to hire the best.
              </p>
              <button
                type="button"
                onClick={() => navigate('/recruiter/candidates')}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-lg transition"
              >
                <span>Explore Talent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Decorative Magnifier & Candidate Cards Illustration */}
            <div className="absolute right-2 bottom-2 w-28 h-28 pointer-events-none opacity-80">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="45" r="28" stroke="#3b82f6" strokeWidth="4" fill="#0f1b33" fillOpacity="0.7" />
                <line x1="70" y1="65" x2="92" y2="87" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
                <rect x="36" y="32" width="28" height="26" rx="4" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
                <circle cx="50" cy="41" r="5" fill="#93c5fd" />
                <line x1="42" y1="51" x2="58" y2="51" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
