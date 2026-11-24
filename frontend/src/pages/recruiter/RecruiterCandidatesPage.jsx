import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  CheckCircle2,
  Users,
  ShieldCheck,
  Send,
  Star,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Award,
  Code
} from 'lucide-react';
import { Alert } from '../../components/common/Alert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const RecruiterCandidatesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTech, setSelectedTech] = useState('All');
  const [minMatch, setMinMatch] = useState(70);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [shortlistedMap, setShortlistedMap] = useState(() => {
    try {
      const saved = localStorage.getItem('kasumo_shortlisted_ids');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [invitedMap, setInvitedMap] = useState({});
  const [alert, setAlert] = useState({ type: null, message: null });

  const candidatesList = [
    {
      id: 'cand-1',
      name: 'Arjun Reddy',
      university: 'IIIT RGUKT • B.Tech CSE (2025)',
      experience: '1.5 yrs practical code proof',
      matchScore: 96,
      avatar: 'AR',
      verifiedSkills: ['Java', 'Spring Boot', 'AWS Cloud', 'REST API Architecture'],
      selfReportedSkills: ['Docker', 'Kafka'],
      strengths: 'Strong deterministic test coverage on GitHub repositories and microservices benchmark project.',
      gaps: 'No verified production deployment evidence for Kafka.'
    },
    {
      id: 'cand-2',
      name: 'Sneha Kumar',
      university: 'RGUKT IIIT • Computer Science (2026)',
      experience: '1.5 yrs project engineering',
      matchScore: 94,
      avatar: 'SK',
      verifiedSkills: ['Java', 'Python', 'System Design', 'PostgreSQL'],
      selfReportedSkills: ['FastAPI', 'Redis'],
      strengths: 'Peer-verified database query optimization whitepaper and distributed caching benchmark.',
      gaps: 'Developing stage for containerized deployments.'
    },
    {
      id: 'cand-3',
      name: 'Vikram Das',
      university: 'IIT RK Valley • Software Engineering (2025)',
      experience: '2 yrs verifiable code',
      matchScore: 91,
      avatar: 'VD',
      verifiedSkills: ['Java', 'Spring Boot', 'Data Structures & Algorithms', 'MySQL'],
      selfReportedSkills: ['React', 'TypeScript'],
      strengths: 'High-score algorithmic screening benchmark and clean OOP modular monolith projects.',
      gaps: 'Limited frontend evidence submitted.'
    },
    {
      id: 'cand-4',
      name: 'Priya Singh',
      university: 'RGUKT Nuzvid • Information Tech (2026)',
      experience: '1.8 yrs distributed systems',
      matchScore: 89,
      avatar: 'PS',
      verifiedSkills: ['Java', 'Cloud Engineering', 'Microservices', 'Docker'],
      selfReportedSkills: ['Kubernetes'],
      strengths: 'Demonstrated cloud deployment with live HTTPS verification URL.',
      gaps: 'No Kubernetes cluster admin certification evidence.'
    },
    {
      id: 'cand-5',
      name: 'Rahul Varma',
      university: 'IIIT RGUKT • Data Intelligence (2025)',
      experience: '2 yrs analytical software',
      matchScore: 87,
      avatar: 'RV',
      verifiedSkills: ['Python', 'Data Science', 'Machine Learning', 'SQL'],
      selfReportedSkills: ['PyTorch', 'FastAPI'],
      strengths: 'Published competitive data analysis model with verified code repository.',
      gaps: 'Developing backend REST integration.'
    }
  ];

  const handleToggleShortlist = (cand) => {
    const next = { ...shortlistedMap, [cand.id]: !shortlistedMap[cand.id] };
    setShortlistedMap(next);
    localStorage.setItem('kasumo_shortlisted_ids', JSON.stringify(next));
    if (next[cand.id]) {
      setAlert({ type: 'success', message: `${cand.name} added to your candidate shortlist.` });
    } else {
      setAlert({ type: 'info', message: `${cand.name} removed from your shortlist.` });
    }
  };

  const handleInvite = (cand) => {
    setInvitedMap((prev) => ({ ...prev, [cand.id]: true }));
    setAlert({ type: 'success', message: `Opportunity outreach dispatched to ${cand.name}.` });
  };

  const filteredCandidates = candidatesList.filter((cand) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = cand.name.toLowerCase().includes(q);
      const matchUniv = cand.university.toLowerCase().includes(q);
      const matchSkills = cand.verifiedSkills.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchUniv && !matchSkills) return false;
    }
    if (selectedTech !== 'All') {
      const hasTech = cand.verifiedSkills.includes(selectedTech) || cand.selfReportedSkills.includes(selectedTech);
      if (!hasTech) return false;
    }
    if (cand.matchScore < minMatch) return false;
    if (onlyVerified && cand.verifiedSkills.length === 0) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Find Candidates</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold">
              Evidence Verified
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Discover technical candidates with transparent code artifacts, verified capabilities, and honest gap analysis.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/recruiter/shortlist')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <Star className="w-4 h-4 text-amber-400 fill-current" />
          <span>View Shortlist ({Object.values(shortlistedMap).filter(Boolean).length})</span>
        </button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: null, message: null })} />

      {/* Filter and Search Bar Controls */}
      <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by candidate name, skill (e.g. Java, Python), or institution..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Technology Filter Dropdown */}
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Technologies</option>
              <option value="Java">Java</option>
              <option value="Spring Boot">Spring Boot</option>
              <option value="Python">Python</option>
              <option value="AWS Cloud">AWS Cloud</option>
              <option value="SQL">SQL</option>
              <option value="Data Structures & Algorithms">DSA</option>
            </select>

            {/* Verified Only Toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Verified Proof Only</span>
            </label>
          </div>
        </div>

        {/* Match Threshold Slider */}
        <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
            Min Match Score: <strong className="text-blue-600 dark:text-blue-400">{minMatch}%</strong>
          </span>
          <input
            type="range"
            min={50}
            max={95}
            step={5}
            value={minMatch}
            onChange={(e) => setMinMatch(Number(e.target.value))}
            className="flex-1 accent-blue-600 cursor-pointer"
          />
          <span className="text-xs text-slate-400 font-mono">
            {filteredCandidates.length} candidate(s) surfaced
          </span>
        </div>
      </div>

      {/* Candidates List Cards */}
      <div className="space-y-4">
        {filteredCandidates.map((cand) => {
          const isShortlisted = !!shortlistedMap[cand.id];
          const isInvited = !!invitedMap[cand.id];

          return (
            <div
              key={cand.id}
              className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs hover:shadow-xs transition space-y-4"
            >
              {/* Candidate Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                    {cand.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {cand.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {cand.university} • <span className="font-semibold text-slate-700 dark:text-slate-300">{cand.experience}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Match Indicator */}
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-500">Evidence Match:</span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {cand.matchScore}%
                    </span>
                  </div>

                  {/* Shortlist Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleShortlist(cand)}
                    className={`p-2 rounded-xl border transition ${
                      isShortlisted
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-300 dark:border-amber-700'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-amber-500'
                    }`}
                    title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                  >
                    <Star className={`w-4 h-4 ${isShortlisted ? 'fill-current' : ''}`} />
                  </button>

                  {/* Invite / Outreach Button */}
                  <button
                    type="button"
                    onClick={() => handleInvite(cand)}
                    disabled={isInvited}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs ${
                      isInvited
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isInvited ? 'Outreach Sent' : 'Invite'}</span>
                  </button>
                </div>
              </div>

              {/* Skills Breakdown: Verified vs Self-Reported */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Verified Technical Capabilities
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {cand.verifiedSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/40 inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{s}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Self-Reported / Developing
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {cand.selfReportedSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths & Honest Gaps */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">Demonstrable Strengths:</strong> {cand.strengths}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-800 dark:text-slate-200">Honest Gaps:</strong> {cand.gaps}
                </p>
              </div>
            </div>
          );
        })}

        {filteredCandidates.length === 0 && (
          <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No matching candidate profiles found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your technology filters or lowering your minimum match score threshold.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
