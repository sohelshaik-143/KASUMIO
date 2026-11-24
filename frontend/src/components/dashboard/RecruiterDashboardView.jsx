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
  recentEvidence = [],
  connections = [],
  greeting = 'Good Morning'
}) => {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last 30 Days');
  const [invitedCandidateId, setInvitedCandidateId] = useState(null);

  const recruiterName = user?.fullName || 'Arjun';
  const firstName = recruiterName.split(' ')[0];

  // Live or derived metrics
  const totalPublishedOpportunities = opportunities.filter((o) => o.status === 'PUBLISHED').length;
  const totalApplicationsCount = opportunities.reduce((acc, curr) => acc + (curr.applicationsCount || 14), 0);
  const activeConnectionsCount = connections.filter((c) => c.status === 'ACCEPTED').length;

  // Mock-aligned real candidate data for top recommendations
  const topCandidates = [
    {
      id: 1,
      name: 'Arjun Reddy',
      college: 'IIIT RGUKT',
      skills: ['Java', 'Spring Boot', 'AWS'],
      extraSkillsCount: 2,
      experience: '1.5 yrs',
      matchScore: 96,
      avatar: 'AR'
    },
    {
      id: 2,
      name: 'Sneha Kumar',
      college: 'RGUKT IIIT',
      skills: ['Java', 'Python', 'System Design'],
      extraSkillsCount: 1,
      experience: '1.5 yrs',
      matchScore: 94,
      avatar: 'SK'
    },
    {
      id: 3,
      name: 'Vikram Das',
      college: 'IIT RK Valley',
      skills: ['Java', 'Spring Boot', 'DSA'],
      extraSkillsCount: 1,
      experience: '2 yrs',
      matchScore: 91,
      avatar: 'VD'
    },
    {
      id: 4,
      name: 'Priya Singh',
      college: 'RGUKT Nuzvid',
      skills: ['Java', 'Cloud', 'Microservices'],
      extraSkillsCount: 0,
      experience: '1.8 yrs',
      matchScore: 89,
      avatar: 'PS'
    },
    {
      id: 5,
      name: 'Rahul Varma',
      college: 'IIIT RGUKT',
      skills: ['Python', 'Data Science', 'ML'],
      extraSkillsCount: 1,
      experience: '2 yrs',
      matchScore: 87,
      avatar: 'RV'
    }
  ];

  // Active opportunities list
  const displayOpportunities = opportunities.length > 0 ? opportunities.slice(0, 3) : [
    {
      id: 'mock-1',
      title: 'SDE Intern - Backend Developer',
      location: 'Hyderabad',
      type: 'Internship',
      status: 'Active',
      applications: 92,
      iconType: 'code'
    },
    {
      id: 'mock-2',
      title: 'Software Engineer - Java',
      location: 'Bangalore',
      type: 'Full Time',
      status: 'Active',
      applications: 156,
      iconType: 'briefcase'
    },
    {
      id: 'mock-3',
      title: 'Tech Challenge 2026',
      location: 'Pan India',
      type: 'Hackathon',
      status: 'Active',
      applications: '1.2K',
      iconType: 'trophy'
    }
  ];

  const handleInvite = (candidateId) => {
    setInvitedCandidateId(candidateId);
    setTimeout(() => {
      setInvitedCandidateId(null);
    }, 2500);
  };

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
            {/* Sparkline icon / trend */}
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>12%</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
              248
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
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>18%</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
              127
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
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>25%</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
              {totalApplicationsCount || 42}
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
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>6%</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
              18
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

            {/* Candidates Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-2">Candidate</th>
                    <th className="py-3 px-2">Skills</th>
                    <th className="py-3 px-2">Experience</th>
                    <th className="py-3 px-2">Match</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {topCandidates.map((candidate) => {
                    const isInvited = invitedCandidateId === candidate.id;
                    return (
                      <tr key={candidate.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition">
                        {/* Candidate Name & College */}
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {candidate.avatar}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                                {candidate.name}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {candidate.college}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Skills Pill Badges */}
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                            {candidate.skills.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium text-[11px] border border-blue-100 dark:border-blue-900/40"
                              >
                                {s}
                              </span>
                            ))}
                            {candidate.extraSkillsCount > 0 && (
                              <span className="text-[11px] font-semibold text-slate-400">
                                +{candidate.extraSkillsCount}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Experience */}
                        <td className="py-3.5 px-2 font-medium text-slate-700 dark:text-slate-300">
                          {candidate.experience}
                        </td>

                        {/* Circular Match Percentage */}
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-2">
                            {/* Circular progress visual */}
                            <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                  className="text-slate-200 dark:text-slate-800"
                                  strokeWidth="3.5"
                                  stroke="currentColor"
                                  fill="none"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                  className="text-emerald-500"
                                  strokeDasharray={`${candidate.matchScore}, 100`}
                                  strokeWidth="3.5"
                                  strokeLinecap="round"
                                  stroke="currentColor"
                                  fill="none"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                              </svg>
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {candidate.matchScore}%
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-2 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleInvite(candidate.id)}
                              disabled={isInvited}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition shadow-2xs ${
                                isInvited
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {isInvited ? (
                                <span className="inline-flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Invited</span>
                                </span>
                              ) : (
                                <span>Invite</span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate('/recruiter/candidates')}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition"
                              aria-label="More candidate actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Two Split Cards: Active Opportunities & Recent Activity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

                <div className="space-y-3">
                  {displayOpportunities.map((opp, idx) => (
                    <div
                      key={opp.id || idx}
                      onClick={() => navigate(opp.id ? `/recruiter/opportunities/${opp.id}` : '/recruiter/opportunities')}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          {opp.iconType === 'code' ? (
                            <Code className="w-4 h-4" />
                          ) : opp.iconType === 'trophy' ? (
                            <Trophy className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Briefcase className="w-4 h-4" />
                          )}
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
                          Active
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          {opp.applications || '92'} Applications
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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

                <div className="space-y-3">
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          New candidate applied for SDE Intern
                        </p>
                        <p className="text-[10px] text-slate-400">2 min ago</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          Candidate shortlisted: Sneha Kumar
                        </p>
                        <p className="text-[10px] text-slate-400">5 min ago</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-600 flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          New opportunity posted: Backend Dev
                        </p>
                        <p className="text-[10px] text-slate-400">10 min ago</p>
                      </div>
                    </div>
                  </div>
                </div>
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
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">12.5K</p>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">↑ 20%</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Applications</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">2.1K</p>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">↑ 18%</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Shortlisted</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">412</p>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">↑ 15%</span>
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

            {/* Smooth Curved Dual-Line SVG Area Chart */}
            <div className="relative h-44 w-full pt-2">
              <svg viewBox="0 0 320 140" className="w-full h-full overflow-visible">
                <defs>
                  {/* Views Gradient */}
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Applications Gradient */}
                  <linearGradient id="appsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Shaded Areas */}
                <path
                  d="M10,85 C60,65 110,95 160,50 C210,20 260,70 310,40 L310,130 L10,130 Z"
                  fill="url(#viewsGradient)"
                />
                <path
                  d="M10,110 C60,95 110,115 160,85 C210,65 260,95 310,75 L310,130 L10,130 Z"
                  fill="url(#appsGradient)"
                />

                {/* Smooth Curve 1: Views (Blue) */}
                <path
                  d="M10,85 C60,65 110,95 160,50 C210,20 260,70 310,40"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Smooth Curve 2: Applications (Purple) */}
                <path
                  d="M10,110 C60,95 110,115 160,85 C210,65 260,95 310,75"
                  fill="none"
                  stroke="#9333ea"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                <circle cx="160" cy="50" r="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <circle cx="310" cy="40" r="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <circle cx="160" cy="85" r="3" fill="#9333ea" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="310" cy="75" r="3" fill="#9333ea" stroke="#ffffff" strokeWidth="1.5" />
              </svg>

              {/* X-Axis Date Labels */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-2 mt-1">
                <span>Oct 25</span>
                <span>Nov 01</span>
                <span>Nov 08</span>
                <span>Nov 15</span>
              </div>
            </div>
          </div>

          {/* Promo Card: "Find the Right Talent with KASUMO" */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#070e1e] via-[#0d1b38] to-[#122852] p-5 text-white border border-blue-900/40 shadow-sm overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                Find the Right Talent with KASUMO
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Leverage verified skills and real project evidence to hire the best.
              </p>
              <button
                type="button"
                onClick={() => navigate('/recruiter/candidates')}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl transition shadow-xs"
              >
                <span>Explore Talent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Decorative background circle */}
            <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
