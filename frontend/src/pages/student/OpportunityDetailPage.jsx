import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { discoveryApi } from '../../api/discoveryApi';
import { opportunityApi } from '../../api/opportunityApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { NextMoveCard } from '../../components/action/NextMoveCard';
import { SkillCoverageMatrix } from '../../components/discovery/SkillCoverageMatrix';
import {
  ArrowLeft,
  Sparkles,
  Building,
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  Heart,
  ExternalLink,
  Target
} from 'lucide-react';

/**
 * Student OpportunityDetailPage shows role breakdown, why recommended, and skill coverage.
 */
export const OpportunityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStudent, loading: authLoading } = useAuth();

  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: null, message: null });

  const fetchDetail = async () => {
    if (!id || !user) return;
    try {
      setLoading(true);
      const [data] = await Promise.all([
        discoveryApi.getOpportunityDetail(id),
        discoveryApi.getOpportunityReadiness(id).catch(() => null)
      ]);
      setOpp(data);
    } catch (err) {
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
        <Link to="/student/discover" className="mt-4 inline-block text-teal-700 font-semibold hover:underline min-h-[44px]">
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
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student/discover')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunity Discovery</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition min-h-[44px] ${
              opp.isSaved
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {opp.isSaved ? <BookmarkCheck className="w-4 h-4 text-teal-700" /> : <Bookmark className="w-4 h-4" />}
            <span>{opp.isSaved ? 'Bookmarked' : 'Save'}</span>
          </button>

          {opp.hasExpressedInterest ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 min-h-[44px]">
              <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
              <span>Interest Expressed</span>
            </span>
          ) : (
            <button
              onClick={handleExpressInterest}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition min-h-[44px]"
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
                  className="inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-800 underline underline-offset-2 transition font-medium min-h-[32px]"
                >
                  <span>Official Source ({opp.source || 'Listing'})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif">
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
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
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

          <div className="shrink-0 bg-teal-50/60 border border-teal-100 rounded-2xl p-5 text-center min-w-[220px] shadow-xs space-y-2">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wider block">
              Capability Match Level
            </span>
            <div className="text-xl font-extrabold text-teal-800">
              {opp.matchCategory === 'STRONG' ? 'Strong Match' : opp.matchCategory === 'GOOD' ? 'Good Match' : 'Potential Match'}
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {supportedCount} of {totalSpecs} core requirements supported by evidence
            </p>
          </div>
        </div>

        {opp.whyRecommended && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <span>Why KASUMIO Recommends This Role</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {opp.whyRecommended}
            </p>
            {opp.careerAlignmentNote && (
              <p className="text-xs text-teal-800 pt-1 flex items-center gap-1.5 font-medium">
                <Target className="w-3.5 h-3.5 text-teal-700" />
                <span>{opp.careerAlignmentNote}</span>
              </p>
            )}
          </div>
        )}

        <div className="pt-2">
          <NextMoveCard onActionUpdated={fetchDetail} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Role & Project Description
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-200">
            {opp.description}
          </p>
        </div>
      </div>

      <SkillCoverageMatrix opportunity={opp} />
    </div>
  );
};

export default OpportunityDetailPage;
