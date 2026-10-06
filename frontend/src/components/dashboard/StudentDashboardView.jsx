import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileCode2, Plus, Search, Clock, ArrowRight, Inbox } from 'lucide-react';
import { NextMoveCard } from '../action/NextMoveCard';
import { OutcomeIntelligenceSection } from '../action/OutcomeIntelligenceSection';
import { EvidenceCard } from '../evidence/EvidenceCard';
import { EmptyState } from '../common/EmptyState';
import { StudentDashboardMetrics } from './StudentDashboardMetrics';
import { CapabilitySnapshotCard } from './CapabilitySnapshotCard';
import { RecommendedOpportunitiesList } from './RecommendedOpportunitiesList';

/**
 * Student Dashboard View
 * Displays personalized career intelligence, next best action, evidence portfolio, and recommended roles.
 */
export const StudentDashboardView = ({
  user,
  metrics,
  recentEvidence = [],
  skills = [],
  connections = [],
  recommendations = [],
  outcomeData,
  greeting = 'Welcome back',
  onOpenTemplatePicker,
  onOpenDirectForm,
  onCapabilityClick,
  onActionUpdated,
  onRecalculateOutcome,
}) => {
  const navigate = useNavigate();
  const [dashboardQuery, setDashboardQuery] = useState('');

  const totalEv = metrics?.totalEvidenceCount ?? recentEvidence.length;
  const verifiedEv = metrics?.verifiedEvidenceCount ?? recentEvidence.filter((e) => e.verified).length;
  const pendingRequests = connections.filter((c) => c.status === 'PENDING').length;
  const activeConnectionsCount = connections.filter((c) => c.status === 'ACCEPTED').length;

  // Compute capability states from skills and evidence
  const demonstratedSkillIds = new Set(recentEvidence.map((e) => e.skillId));
  const verifiedSkillIds = new Set(recentEvidence.filter((e) => e.verified).map((e) => e.skillId));

  const strongCapabilities = skills.filter((s) => verifiedSkillIds.has(s.id));
  const developingCapabilities = skills.filter((s) => demonstratedSkillIds.has(s.id) && !verifiedSkillIds.has(s.id));
  const learningCapabilities = skills.filter((s) => !demonstratedSkillIds.has(s.id)).slice(0, 6);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!dashboardQuery.trim()) return;
    navigate(`/student/discover?query=${encodeURIComponent(dashboardQuery.trim())}`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* 1. Personalized Greeting Banner & Global Search */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Career Intelligence Active
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {verifiedEv} / {totalEv} Proof Verified
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {greeting}, {user?.fullName || user?.email?.split('@')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Your career roadmap is connected to real evidence. Explore opportunities, track capability states, and unlock next moves.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={onOpenTemplatePicker}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              <FileCode2 className="w-4 h-4 text-indigo-600" />
              <span>Use Template</span>
            </button>

            <button
              onClick={onOpenDirectForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Evidence</span>
            </button>
          </div>
        </div>

        {/* Global Opportunity / Skill / Company Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={dashboardQuery}
            onChange={(e) => setDashboardQuery(e.target.value)}
            placeholder="Global search across opportunities, taxonomy skills, or target companies..."
            className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* 2. Today's Focus & Next Move Engine */}
      <NextMoveCard onActionUpdated={onActionUpdated} />

      {/* Feature 05: Evidence -> Outcome Intelligence & Graphical Progression */}
      <OutcomeIntelligenceSection outcomeData={outcomeData} onRecalculate={onRecalculateOutcome} />

      {/* Incoming Connection Alert */}
      {pendingRequests > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900">
                You have {pendingRequests} incoming recruiter connection request{pendingRequests > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Recruiters discovered your proof footprint and requested to connect. You choose what information to disclose.
              </p>
            </div>
          </div>
          <Link
            to="/student/connections"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shrink-0 transition shadow-xs"
          >
            <span>Review Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3. Capability Snapshot */}
      <CapabilitySnapshotCard
        strongCapabilities={strongCapabilities}
        developingCapabilities={developingCapabilities}
        learningCapabilities={learningCapabilities}
        onCapabilityClick={onCapabilityClick}
      />

      {/* 4. Evidence Footprint Metrics */}
      <StudentDashboardMetrics
        totalEvidence={totalEv}
        verifiedEvidence={verifiedEv}
        careerGoalsCount={metrics?.careerGoalsCount ?? 0}
        activeConnectionsCount={activeConnectionsCount}
      />

      {/* 5. Recommended Opportunities */}
      <RecommendedOpportunitiesList recommendations={recommendations} />

      {/* 6. Recent Evidence Footprint Submissions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Recent Evidence Footprint
          </h2>
          <Link
            to="/evidence"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View Portfolio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentEvidence.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No evidence submitted yet"
            description="Your evidence footprint starts empty. Use a standardized template to add your first demonstrative code repository, project, or certificate."
            actionText="Use a Template to Begin"
            onAction={onOpenTemplatePicker}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentEvidence.slice(0, 4).map((ev) => (
              <EvidenceCard key={ev.id} evidence={ev} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
