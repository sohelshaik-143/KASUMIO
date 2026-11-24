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
      {/* 1. Header Banner & Quick Actions */}
      <div className="kasumo-card p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-verified-light text-verified border border-verified-border">
                Proof-Based Profile
              </span>
              <span className="text-xs text-ink-muted font-mono tabular-nums">
                {verifiedEv} / {totalEv} Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight font-serif">
              {greeting}, {user?.fullName || user?.email?.split('@')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-xl">
              Your career roadmap is grounded in verifiable evidence. Track demonstration states, explore opportunities, and take your next move.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={onOpenTemplatePicker}
              className="min-h-[40px] inline-flex items-center gap-2 px-3.5 py-2 bg-paper-subtle hover:bg-paper-border text-ink text-xs font-semibold rounded-lg border border-paper-border transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified"
            >
              <FileCode2 className="w-4 h-4 text-verified" aria-hidden="true" />
              <span>Use Template</span>
            </button>

            <button
              type="button"
              onClick={onOpenDirectForm}
              className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 bg-verified hover:bg-verified-hover text-white text-xs font-semibold rounded-lg shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified focus-visible:ring-offset-2"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Evidence</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <label htmlFor="dashboard-search-input" className="sr-only">Search roles, skills, or organizations</label>
          <Search className="w-4 h-4 text-ink-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            id="dashboard-search-input"
            type="search"
            value={dashboardQuery}
            onChange={(e) => setDashboardQuery(e.target.value)}
            placeholder="Search roles, skills, or organizations across the market..."
            className="w-full pl-10 pr-24 py-2.5 bg-paper-subtle border border-paper-border rounded-lg text-xs text-ink placeholder-ink-subtle focus:outline-hidden focus:ring-2 focus:ring-verified focus:bg-white transition"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-ink text-white hover:bg-slate-800 text-xs font-semibold rounded-md transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified"
          >
            Search
          </button>
        </form>
      </div>

      {/* 2. Today's Focus & Next Move Engine */}
      <NextMoveCard onActionUpdated={onActionUpdated} />

      {/* Outcome Intelligence Section */}
      <OutcomeIntelligenceSection outcomeData={outcomeData} onRecalculate={onRecalculateOutcome} />

      {/* Incoming Connection Alert */}
      {pendingRequests > 0 && (
        <div className="bg-unverified-light border border-unverified-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-lg bg-white border border-unverified-border text-unverified shrink-0">
              <Clock className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink">
                You have {pendingRequests} incoming recruiter connection request{pendingRequests > 1 ? 's' : ''}
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Recruiters discovered your verifiable proof. You control what information to disclose.
              </p>
            </div>
          </div>
          <Link
            to="/student/connections"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-unverified hover:bg-unverified-hover text-white text-xs font-semibold rounded-lg shrink-0 transition shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-unverified"
          >
            <span>Review Requests</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
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
          <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight font-serif">
            Recent Evidence Footprint
          </h2>
          <Link
            to="/evidence"
            className="text-xs font-semibold text-verified hover:text-verified-hover flex items-center gap-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified rounded"
          >
            <span>View Portfolio</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
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

export default StudentDashboardView;
