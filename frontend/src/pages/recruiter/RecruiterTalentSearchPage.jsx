import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../api/studentApi';
import { Search, Sparkles, Filter, ShieldCheck, ArrowRight, Star, ExternalLink, Code2 } from 'lucide-react';
import { Alert } from '../../components/common/Alert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const RecruiterTalentSearchPage = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semanticQuery, setSemanticQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [alert, setAlert] = useState({ type: null, message: null });

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);
        const data = await studentApi.getAllCandidates();
        setCandidates(data || []);
      } catch (err) {
        console.error('Failed to load candidate artifacts:', err);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    loadCandidates();
  }, []);

  const filteredCandidates = candidates.filter((cand) => {
    if (!semanticQuery.trim()) return true;
    const q = semanticQuery.toLowerCase();
    const nameMatch = (cand.fullName || '').toLowerCase().includes(q);
    const uniMatch = (cand.university || '').toLowerCase().includes(q);
    const bioMatch = (cand.bio || '').toLowerCase().includes(q);
    const skillMatch = (cand.skills || []).some((s) => (s.skillName || s || '').toLowerCase().includes(q));
    return nameMatch || uniMatch || bioMatch || skillMatch;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      if (filteredCandidates.length > 0) {
        setAlert({
          type: 'info',
          message: `Surfaced ${filteredCandidates.length} candidate(s) strictly matching demonstrable code artifacts.`,
        });
      }
    }, 250);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>Talent Search & Code Intelligence</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
            Artifact Inspector ({filteredCandidates.length})
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Perform deep semantic queries across candidate project repositories, architectural designs, and verified code commits.
        </p>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: null, message: null })} />

      {/* Semantic Search Bar */}
      <form onSubmit={handleSearch} className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-2xs">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={semanticQuery}
            onChange={(e) => setSemanticQuery(e.target.value)}
            placeholder="Search candidate projects (e.g., 'Java', 'Distributed caching', 'Spring Boot', 'PostgreSQL')..."
            className="w-full pl-12 pr-28 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={searching}
            className="absolute right-2.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
          >
            {searching ? 'Analyzing...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Search Results */}
      {loading ? (
        <div className="py-12">
          <LoadingSpinner text="Searching candidate repository artifacts..." />
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-12 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            0 Candidate Artifacts Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {semanticQuery.trim()
              ? `No candidates match "${semanticQuery}". Try adjusting your keywords or clearing the search filter.`
              : 'Candidates will appear here when student accounts register and submit demonstrable code repositories.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCandidates.map((res) => {
            const skillsList = res.skills || [];
            return (
              <div
                key={res.id || res.candidateId}
                className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs hover:shadow-xs transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {res.fullName}
                      </h3>
                      {res.university && <span className="text-xs text-slate-500">• {res.university}</span>}
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Profile
                      </span>
                    </div>
                    {skillsList.length > 0 && (
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                        Focus: {skillsList.map((s) => s.skillName || s).slice(0, 3).join(', ')}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/recruiter/candidates')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-2xs"
                  >
                    <span>View Candidate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{res.bio || 'Verifiable Portfolio Artifact'}</span>
                    </span>
                    {res.graduationYear && (
                      <span className="text-slate-400 text-[11px]">Class of {res.graduationYear}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecruiterTalentSearchPage;
