import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { discoveryApi } from '../../api/discoveryApi';
import { opportunityApi } from '../../api/opportunityApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import {
  ArrowLeft,
  Sparkles,
  Building,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  MinusCircle,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  Heart,
  ExternalLink,
  Target,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen,
  Plus,
  Compass,
  Zap,
  Gauge
} from 'lucide-react';

export const OpportunityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStudent, loading: authLoading } = useAuth();

  const [opp, setOpp] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: null, message: null });

  const fetchDetail = async () => {
    if (!id || !user) return;
    try {
      setLoading(true);
      const [data, readData] = await Promise.all([
        discoveryApi.getOpportunityDetail(id),
        discoveryApi.getOpportunityReadiness(id)
      ]);
      setOpp(data);
      setReadiness(readData);
    } catch (err) {
      console.error('Failed to load opportunity detail:', err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Could not load opportunity details.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && isStudent) {
      fetchDetail();
    }
  }, [id, authLoading, user?.id, isStudent]);

  const handleToggleSave = async () => {
    if (!opp) return;
    try {
      if (opp.isSaved) {
        await discoveryApi.unsaveOpportunity(opp.id);
        setOpp({ ...opp, isSaved: false, saveStatus: null });
        setAlert({ type: 'info', message: 'Removed from saved opportunities.' });
      } else {
        await discoveryApi.saveOpportunity(opp.id, 'SAVED');
        setOpp({ ...opp, isSaved: true, saveStatus: 'SAVED' });
        setAlert({ type: 'success', message: 'Opportunity bookmarked.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update saved status.' });
    }
  };

  const handleExpressInterest = async () => {
    if (!opp) return;
    try {
      await opportunityApi.expressInterest(opp.id);
      setOpp({ ...opp, hasExpressedInterest: true });
      setAlert({
        type: 'success',
        message: 'Interest expressed! Hiring team can inspect your anonymous proof footprint.'
      });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to express interest.'
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <LoadingSpinner size="lg" text="Computing deterministic capability match & readiness intelligence..." />
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <Alert type="error" message="Opportunity not found." />
        <Link to="/student/discover" className="mt-4 inline-block text-teal-400 font-semibold hover:underline">
          Return to Discovery Feed
        </Link>
      </div>
    );
  }

  const matchScore = readiness?.matchScore ?? opp.matchScore;
  const readinessScore = readiness?.readinessScore ?? Math.round(matchScore * 0.9);
  const evidenceScore = readiness?.evidenceStrengthScore ?? Math.round(matchScore * 0.8);
  const oppDistance = readiness?.opportunityDistance ?? (opp.gaps?.length || 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student/discover')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunity Discovery</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              opp.isSaved
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {opp.isSaved ? <BookmarkCheck className="w-4 h-4 text-teal-400" /> : <Bookmark className="w-4 h-4" />}
            <span>{opp.isSaved ? 'Bookmarked' : 'Save'}</span>
          </button>

          {opp.hasExpressedInterest ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-rose-950/80 text-rose-300 border border-rose-800/80">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              <span>Interest Expressed</span>
            </span>
          ) : (
            <button
              onClick={handleExpressInterest}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              <Heart className="w-4 h-4" />
              <span>Express Interest</span>
            </button>
          )}
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {/* Hero Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-xl bg-slate-800 text-teal-300 border border-slate-700">
                <Building className="w-3.5 h-3.5" />
                {opp.organizationName}
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-850 text-slate-300 border border-slate-700 uppercase">
                {opp.type} • {opp.workType}
              </span>
              {opp.sourceUrl && (
                <a
                  href={opp.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-teal-300 underline underline-offset-2 transition"
                >
                  <span>Official Source ({opp.source || 'Listing'})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {opp.title}
            </h1>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400 flex-wrap pt-1">
              {opp.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {opp.location}
                </span>
              )}
              {opp.compensation && (
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  {opp.compensation}
                </span>
              )}
              {opp.duration && (
                <span className="text-slate-400">• {opp.duration}</span>
              )}
              {opp.deadline && (
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Clock className="w-4 h-4 text-amber-400" />
                  {opp.deadlineNote}
                </span>
              )}
            </div>
          </div>

          {/* Graph 2: Opportunity Readiness Triple-Gauge Card */}
          <div className="shrink-0 bg-slate-950/90 border border-slate-800 rounded-2xl p-5 text-center min-w-[220px] shadow-inner space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Graph 2 — Readiness Intelligence
            </span>

            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 block font-bold">MATCH</span>
                <span className="text-xl font-black text-teal-400">{matchScore}</span>
              </div>
              <div className="space-y-0.5 border-x border-slate-850">
                <span className="text-[10px] text-slate-500 block font-bold">READINESS</span>
                <span className="text-xl font-black text-indigo-400">{readinessScore}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 block font-bold">EVIDENCE</span>
                <span className="text-xl font-black text-emerald-400">{evidenceScore}</span>
              </div>
            </div>

            <span className="inline-block text-xs font-bold px-3 py-1 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wide">
              {opp.matchCategory}
            </span>
          </div>
        </div>

        {/* Explainable Why Recommended Section */}
        <div className="bg-teal-950/25 border border-teal-800/40 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Why KASUMO Recommends This Role</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {opp.whyRecommended}
          </p>
          {opp.careerAlignmentNote && (
            <p className="text-xs text-teal-300/90 pt-1 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-teal-400" />
              <span>{opp.careerAlignmentNote}</span>
            </p>
          )}
        </div>

        {/* Graph 6: Opportunity Distance Stepper */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>Graph 6 — Opportunity Capability Distance</span>
            </span>
            <span className="text-xs font-mono font-bold text-amber-300">
              {oppDistance === 0 ? 'Day-1 Competitive' : `${oppDistance} capability gap${oppDistance > 1 ? 's' : ''}`}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {readiness?.opportunityDistanceExplanation || (
              oppDistance === 0
                ? 'Your portfolio fully proves all required capabilities.'
                : `Closing ${oppDistance} skill gap(s) elevates you to peak competitiveness for this role.`
            )}
          </p>
        </div>

        {/* Opportunity Description */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Role & Project Description
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80">
            {opp.description}
          </p>
        </div>
      </div>

      {/* Structured Requirements & Eligibility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Eligibility Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Eligibility Assessment</span>
          </div>
          <div className="flex items-start gap-2.5 pt-1">
            {opp.eligible ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-semibold text-white">
                {opp.eligible ? 'Candidate Eligible' : 'Eligibility Criteria Mismatch'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {opp.eligibilityReason}
              </p>
            </div>
          </div>
        </div>

        {/* Experience Requirements */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Experience Expectation
          </span>
          <p className="text-xs text-slate-200 font-medium">
            {opp.experienceRequirements || 'Open to all verified levels'}
          </p>
        </div>

        {/* Education Requirements */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Education Criteria
          </span>
          <p className="text-xs text-slate-200 font-medium">
            {opp.educationRequirements || 'Undergraduate or equivalent'}
          </p>
        </div>
      </div>

      {/* Graph 3: Complete Technology Capability Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-400" />
            <span>Graph 3 — Skill & Evidence Coverage Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Traceable mapping between opportunity requirements and your demonstrable portfolio evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opp.skillEvaluations && opp.skillEvaluations.map((skill) => (
            <div
              key={skill.skillId}
              className={`p-4 rounded-2xl border text-xs space-y-2 transition ${
                skill.matchStatus === 'MATCHED'
                  ? 'bg-emerald-950/20 border-emerald-800/40'
                  : skill.matchStatus === 'PARTIAL'
                  ? 'bg-teal-950/20 border-teal-800/40'
                  : 'bg-slate-850/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {skill.matchStatus === 'MATCHED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : skill.matchStatus === 'PARTIAL' ? (
                    <AlertCircle className="w-4 h-4 text-teal-400 shrink-0" />
                  ) : (
                    <MinusCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <span className="font-bold text-white text-sm">{skill.skillName}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {skill.requirementType?.toLowerCase()}
                  </span>
                  {skill.verified && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <p className="text-slate-400 text-[11px] leading-relaxed">
                {skill.explanation}
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-800/60">
                <span>Category: {skill.category}</span>
                {skill.ecosystem && <span>Ecosystem: {skill.ecosystem}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prioritized Technology Gaps & Preparation Plan */}
      {opp.gaps && opp.gaps.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Prioritized Gaps & Preparation Plan
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Concrete actions to strengthen candidate readiness using Feature 04 evidence templates.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {opp.gaps.map((gap) => (
              <div
                key={gap.skillId}
                className="bg-slate-850 border border-slate-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{gap.skillName}</span>
                    <span className="text-xs text-slate-400">({gap.category})</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
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

                <p className="text-xs text-slate-300">
                  <span className="font-semibold text-slate-200">Why: </span>
                  {gap.priorityReason}
                </p>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-teal-300">
                  <div className="flex items-start gap-2.5">
                    <BookOpen className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Recommended Action: </strong>
                      {gap.recommendedAction}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate('/evidence')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition shrink-0 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Build Evidence</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityDetailPage;
