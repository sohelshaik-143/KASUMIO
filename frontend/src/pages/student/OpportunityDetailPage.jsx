import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { discoveryApi } from '../../api/discoveryApi';
import { opportunityApi } from '../../api/opportunityApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { NextMoveCard } from '../../components/action/NextMoveCard';
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
  TrendingUp,
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
        <Link to="/student/discover" className="mt-4 inline-block text-indigo-600 font-semibold hover:underline">
          Return to Discovery Feed
        </Link>
      </div>
    );
  }

  const supportedCount = opp.strongSkills?.length || 0;
  const gapCount = opp.missingSkills?.length || 0;
  const totalSpecs = supportedCount + gapCount || 5;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student/discover')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunity Discovery</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              opp.isSaved
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {opp.isSaved ? <BookmarkCheck className="w-4 h-4 text-indigo-600" /> : <Bookmark className="w-4 h-4" />}
            <span>{opp.isSaved ? 'Bookmarked' : 'Save'}</span>
          </button>

          {opp.hasExpressedInterest ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
              <span>Interest Expressed</span>
            </span>
          ) : (
            <button
              onClick={handleExpressInterest}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
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
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                {opp.organizationName}
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200">
                {opp.type} • {opp.workType}
              </span>
              {opp.sourceUrl && (
                <a
                  href={opp.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 underline underline-offset-2 transition font-medium"
                >
                  <span>Official Source ({opp.source || 'Listing'})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {opp.title}
            </h1>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 flex-wrap pt-1">
              {opp.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {opp.location}
                </span>
              )}
              {opp.compensation && (
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  {opp.compensation}
                </span>
              )}
              {opp.duration && (
                <span className="text-slate-400">• {opp.duration}</span>
              )}
              {opp.deadline && (
                <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                  <Clock className="w-4 h-4 text-amber-600" />
                  {opp.deadlineNote || opp.deadline}
                </span>
              )}
            </div>
          </div>

          {/* Explainable Match Status Card */}
          <div className="shrink-0 bg-indigo-50/60 border border-indigo-100 rounded-2xl p-5 text-center min-w-[220px] shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">
              Capability Match Level
            </span>
            <div className="text-xl font-extrabold text-indigo-700">
              {opp.matchCategory === 'STRONG' ? 'Strong Match' : opp.matchCategory === 'GOOD' ? 'Good Match' : 'Potential Match'}
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {supportedCount} of {totalSpecs} core requirements supported by evidence
            </p>
          </div>
        </div>

        {/* Explainable Why Recommended Section */}
        {opp.whyRecommended && (
          <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Why KASUMIO Recommends This Role</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {opp.whyRecommended}
            </p>
            {opp.careerAlignmentNote && (
              <p className="text-xs text-indigo-800 pt-1 flex items-center gap-1.5 font-medium">
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                <span>{opp.careerAlignmentNote}</span>
              </p>
            )}
          </div>
        )}

        {/* Next Move Component */}
        <div className="pt-2">
          <NextMoveCard onActionUpdated={fetchDetail} />
        </div>

        {/* Opportunity Description */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Role & Project Description
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-200">
            {opp.description}
          </p>
        </div>
      </div>

      {/* Structured Requirements & Eligibility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Eligibility Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Eligibility Assessment</span>
          </div>
          <div className="flex items-start gap-2.5 pt-1">
            {opp.eligible ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-semibold text-slate-900">
                {opp.eligible ? 'Candidate Eligible' : 'Eligibility Criteria Mismatch'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {opp.eligibilityReason}
              </p>
            </div>
          </div>
        </div>

        {/* Experience Requirements */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Experience Expectation
          </span>
          <p className="text-xs text-slate-800 font-medium">
            {opp.experienceRequirements || 'Open to all verified levels'}
          </p>
        </div>

        {/* Education Requirements */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-xs">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Education Criteria
          </span>
          <p className="text-xs text-slate-800 font-medium">
            {opp.educationRequirements || 'Undergraduate or equivalent'}
          </p>
        </div>
      </div>

      {/* Skill & Evidence Coverage Matrix */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Skill & Evidence Coverage Matrix</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Traceable mapping between opportunity requirements and your demonstrable portfolio evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opp.skillEvaluations && opp.skillEvaluations.map((skill) => (
            <div
              key={skill.skillId}
              className={`p-4 rounded-2xl border text-xs space-y-2 transition ${
                skill.matchStatus === 'MATCHED'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : skill.matchStatus === 'PARTIAL'
                  ? 'bg-indigo-50/50 border-indigo-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {skill.matchStatus === 'MATCHED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : skill.matchStatus === 'PARTIAL' ? (
                    <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                  ) : (
                    <MinusCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-bold text-slate-900 text-sm">{skill.skillName}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {skill.requirementType?.toLowerCase()}
                  </span>
                  {skill.verified && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <p className="text-slate-600 text-[11px] leading-relaxed">
                {skill.explanation}
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-100">
                <span>Category: {skill.category}</span>
                {skill.ecosystem && <span>Ecosystem: {skill.ecosystem}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetailPage;
