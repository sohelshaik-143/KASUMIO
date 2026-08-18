import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { discoveryApi } from '../../api/discoveryApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import {
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Plus,
  Compass,
  Layers,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Target
} from 'lucide-react';

export const GapAnalysisPage = () => {
  const { user, isStudent, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: null, message: null });
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');

  const fetchGapReport = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await discoveryApi.getGapReport();
      setReport(data);
    } catch (err) {
      console.error('Failed to load gap report:', err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Could not compute technology gap report.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && isStudent) {
      fetchGapReport();
    }
  }, [authLoading, user?.id, isStudent]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingSpinner size="lg" text="Aggregating technology gap intelligence across all opportunities..." />
      </div>
    );
  }

  const allGaps = [
    ...(report?.highPriorityGaps || []),
    ...(report?.mediumPriorityGaps || []),
    ...(report?.lowPriorityGaps || []),
  ];

  const filteredGaps = activeCategoryFilter === 'ALL'
    ? allGaps
    : allGaps.filter((g) => g.category === activeCategoryFilter);

  const categories = Object.keys(report?.gapsByCategory || {});

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Technology Gap Intelligence
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Prioritized roadmap of missing technologies across the entire software ecosystem. Unblock higher match scores with demonstrable evidence.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/student/intelligence')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-600/30 to-indigo-600/30 hover:from-teal-600/40 hover:to-indigo-600/40 text-teal-300 hover:text-white border border-teal-500/40 rounded-xl text-xs font-semibold transition shadow-sm active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Career Intelligence & What-If</span>
          </button>
          <button
            onClick={() => navigate('/evidence')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold transition shadow-sm active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Portfolio Proof</span>
          </button>
          <button
            onClick={() => navigate('/student/discover')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-semibold transition"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Roles</span>
          </button>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1.5 shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Opportunities Analyzed
          </span>
          <div className="text-3xl font-black text-white">
            {report?.totalOpportunitiesAnalyzed || 0}
          </div>
          <p className="text-xs text-slate-500">Live active opportunities surveyed</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1.5 shadow-xl">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
            High Priority Gaps
          </span>
          <div className="text-3xl font-black text-rose-400">
            {report?.highPriorityGaps?.length || 0}
          </div>
          <p className="text-xs text-slate-500">Required across multiple matching roles</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1.5 shadow-xl">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            Medium Priority Gaps
          </span>
          <div className="text-3xl font-black text-amber-400">
            {report?.mediumPriorityGaps?.length || 0}
          </div>
          <p className="text-xs text-slate-500">Preferred skills in candidate pool</p>
        </div>
      </div>

      {/* Category Filter Chips */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Filter by Technology Domain
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveCategoryFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategoryFilter === 'ALL'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Domains ({allGaps.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeCategoryFilter === cat
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat} ({report?.gapsByCategory[cat]})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prioritized Gaps List */}
      {filteredGaps.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Zero Technology Gaps!"
          description="Your verified portfolio evidence matches all requirements across active opportunities in this category."
          actionText="Discover Matches"
          onAction={() => navigate('/student/discover')}
        />
      ) : (
        <div className="space-y-4">
          {filteredGaps.map((gap) => (
            <div
              key={gap.skillId}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl space-y-4 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base font-bold text-white">{gap.skillName}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {gap.category} {gap.ecosystem ? `• ${gap.ecosystem}` : ''}
                  </span>
                  <span className="text-xs text-slate-500">
                    Impacts {gap.opportunitiesAffectedCount} active opportunity(s)
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-xl border shrink-0 ${
                    gap.priority === 'HIGH'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                      : gap.priority === 'MEDIUM'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {gap.priority} Priority Gap
                </span>
              </div>

              {/* Priority Reason */}
              <p className="text-xs sm:text-sm text-slate-300">
                <span className="font-semibold text-slate-200">Why It Matters: </span>
                {gap.priorityReason}
              </p>

              {/* Action Recommendation Box */}
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 flex items-start gap-3 text-xs text-teal-300">
                <BookOpen className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-white block">Action Plan:</strong>
                  <p className="text-slate-300">{gap.recommendedAction}</p>
                </div>
              </div>

              {/* Related Opportunities sample */}
              {gap.relatedOpportunityTitles && gap.relatedOpportunityTitles.length > 0 && (
                <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-2 flex-wrap">
                  <span>Appears in:</span>
                  {gap.relatedOpportunityTitles.map((title, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-850"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
