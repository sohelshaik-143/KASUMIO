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
  Sparkles,
  CheckCircle2,
  ArrowRight
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Skill Gaps & Growth Roadmap
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Prioritized growth roadmap connecting skill gaps directly to opportunities: Gap → Why it matters → Recommended action → Opportunity impact.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/student/intelligence')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Career Intelligence & What-If</span>
          </button>
          <button
            onClick={() => navigate('/evidence')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Portfolio Proof</span>
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
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Opportunities Surveyed
          </span>
          <div className="text-3xl font-black text-slate-900">
            {report?.totalOpportunitiesAnalyzed || 0}
          </div>
          <p className="text-xs text-slate-500">Live active opportunities surveyed</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
            High Priority Gaps
          </span>
          <div className="text-3xl font-black text-rose-600">
            {report?.highPriorityGaps?.length || 0}
          </div>
          <p className="text-xs text-slate-500">Required across multiple matching roles</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
            Medium Priority Gaps
          </span>
          <div className="text-3xl font-black text-amber-600">
            {report?.mediumPriorityGaps?.length || 0}
          </div>
          <p className="text-xs text-slate-500">Preferred skills in candidate pool</p>
        </div>
      </div>

      {/* Category Filter Chips */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Filter by Technology Domain
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategoryFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategoryFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
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
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
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
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-6 shadow-xs space-y-4 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900">{gap.skillName}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
                    {gap.category} {gap.ecosystem ? `• ${gap.ecosystem}` : ''}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-xl border shrink-0 ${
                    gap.priority === 'HIGH'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : gap.priority === 'MEDIUM'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {gap.priority} Priority Gap
                </span>
              </div>

              {/* UX Chain: Gap -> Why it matters -> Recommended action -> Opportunity impact */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">1. Why It Matters</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{gap.priorityReason}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">2. Recommended Action</span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">{gap.recommendedAction}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">3. Opportunity Impact</span>
                  <p className="text-xs text-emerald-900 font-extrabold">
                    Unlocks {gap.opportunitiesAffectedCount || 1} active market role(s)
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-2 flex items-center justify-between">
                {gap.relatedOpportunityTitles && gap.relatedOpportunityTitles.length > 0 && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                    <span>Impacts roles:</span>
                    {gap.relatedOpportunityTitles.map((title, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {title}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => navigate('/evidence')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs ml-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Proof for {gap.skillName}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
