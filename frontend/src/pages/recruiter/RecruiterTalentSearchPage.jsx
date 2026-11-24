import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Filter, ShieldCheck, ArrowRight, Star, ExternalLink, Code2 } from 'lucide-react';
import { Alert } from '../../components/common/Alert';

export const RecruiterTalentSearchPage = () => {
  const navigate = useNavigate();
  const [semanticQuery, setSemanticQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [alert, setAlert] = useState({ type: null, message: null });

  const searchResults = [
    {
      id: 'ts-1',
      name: 'Arjun Reddy',
      university: 'IIIT RGUKT',
      primarySkill: 'Java / Distributed Systems',
      repoName: 'distributed-cache-benchmark',
      repoUrl: 'https://github.com/kasumo-demo/distributed-cache',
      verifiedEvidenceTitle: 'High-Throughput In-Memory Caching Engine',
      matchScore: 96,
      highlights: 'Implements thread-safe LRU eviction, Raft consensus algorithm, and JUnit 5 deterministic integration tests.'
    },
    {
      id: 'ts-2',
      name: 'Sneha Kumar',
      university: 'RGUKT IIIT',
      primarySkill: 'PostgreSQL / SQL Performance',
      repoName: 'sql-query-optimizer',
      repoUrl: 'https://github.com/kasumo-demo/sql-optimizer',
      verifiedEvidenceTitle: 'B-Tree Indexing & Query Cost Analyzer',
      matchScore: 94,
      highlights: 'Evaluates composite index cardinality and execution plan bottleneck resolution on 1M+ rows.'
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setAlert({
        type: 'info',
        message: 'Surfaced candidates strictly matching demonstrable evidence in repository commits.'
      });
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>Talent Search & Code Intelligence</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
            Artifact Inspector
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
            placeholder="Search candidate projects (e.g., 'Distributed caching with Raft', 'Spring Boot microservices', 'PostgreSQL indexing')..."
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
      <div className="space-y-4">
        {searchResults.map((res) => (
          <div
            key={res.id}
            className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs hover:shadow-xs transition space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {res.name}
                  </h3>
                  <span className="text-xs text-slate-500">• {res.university}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3" />
                    {res.matchScore}% Proof Match
                  </span>
                </div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  Focus: {res.primarySkill}
                </p>
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
                  <span>{res.verifiedEvidenceTitle}</span>
                </span>
                <a
                  href={res.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 text-[11px]"
                >
                  <span>github/{res.repoName}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {res.highlights}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
