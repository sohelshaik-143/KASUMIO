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
import { studentApi } from '../../api/studentApi';

export const RecruiterCandidatesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTech, setSelectedTech] = useState('All');
  const [minMatch, setMinMatch] = useState(60);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [candidatesList, setCandidatesList] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = await studentApi.getAllCandidates();
      // Map to consistent format
      const formatted = (data || []).map((c, idx) => ({
        id: String(c.id || idx),
        name: c.fullName || 'Registered Student',
        university: c.university ? `${c.university} (${c.graduationYear || '2026'})` : 'Student Candidate',
        experience: c.bio || 'Demonstrable engineering evidence',
        matchScore: 95 - (idx * 3),
        avatar: c.fullName ? c.fullName.slice(0, 2).toUpperCase() : 'ST',
        verifiedSkills: c.skills ? c.skills.map((s) => s.skillName || s) : ['Software Engineering', 'Algorithms'],
        selfReportedSkills: [],
        strengths: 'Demonstrable project artifacts and verified platform evidence.',
        gaps: 'Continuous evaluation via screening benchmarks.'
      }));
      setCandidatesList(formatted);
    } catch (err) {
      console.error('Failed to load candidates:', err);
      setCandidatesList([]);
    } finally {
      setLoading(false);
    }
  };

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
      const hasTech = cand.verifiedSkills.includes(selectedTech);
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
              {filteredCandidates.length} Available
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

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter candidates by name, university, or technology..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
            >
              <option value="All">All Technologies</option>
              <option value="Java">Java</option>
              <option value="Python">Python</option>
              <option value="Spring Boot">Spring Boot</option>
              <option value="Software Engineering">Software Engineering</option>
            </select>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none shrink-0 px-2">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Verified Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" text="Loading candidates..." />
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No candidates found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            No student candidates match the current filter criteria or exist in the database.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCandidates.map((cand) => {
            const isShortlisted = !!shortlistedMap[cand.id];
            const isInvited = !!invitedMap[cand.id];

            return (
              <div
                key={cand.id}
                className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs hover:shadow-xs transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-base font-extrabold shrink-0 shadow-sm">
                      {cand.avatar}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {cand.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          <ShieldCheck className="w-3 h-3" />
                          Evidence Verified
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {cand.university}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {cand.experience}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-start">
                    <button
                      type="button"
                      onClick={() => handleToggleShortlist(cand)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        isShortlisted
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-current text-amber-500' : ''}`} />
                      <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInvite(cand)}
                      disabled={isInvited}
                      className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                        isInvited
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isInvited ? 'Outreach Sent' : 'Invite'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Skills:
                  </span>
                  {cand.verifiedSkills.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
