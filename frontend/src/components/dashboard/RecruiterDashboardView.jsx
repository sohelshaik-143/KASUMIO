import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShieldCheck, Briefcase, ArrowRight, Users, Sparkles } from 'lucide-react';

export const RecruiterDashboardView = ({
  user,
  opportunities = [],
  recentEvidence = [],
  connections = [],
  skills = [],
  greeting = 'Welcome back',
}) => {
  const publishedCount = opportunities.filter((o) => o.status === 'PUBLISHED').length;
  const acceptedConnections = connections.filter((c) => c.status === 'ACCEPTED').length;
  const pendingConnections = connections.filter((c) => c.status === 'PENDING').length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="kasumo-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight font-serif">
            {greeting}, {user?.fullName || user?.email?.split('@')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            Affiliation:{' '}
            <span className="text-verified font-semibold">
              {user?.organizationName || 'Accredited Reviewer'}
            </span>{' '}
            • Institutional Verifier Portal
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/recruiter/opportunities/new"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-verified hover:bg-verified-hover text-white text-xs font-semibold rounded-lg shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Create Opportunity</span>
          </Link>
          <Link
            to="/recruiter/verifications"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-paper-subtle hover:bg-paper-border border border-paper-border text-ink text-xs font-semibold rounded-lg transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified"
          >
            <ShieldCheck className="w-4 h-4 text-verified" aria-hidden="true" />
            <span>Verification Queue</span>
          </Link>
        </div>
      </div>

      {/* Real Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kasumo-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                Opportunities
              </span>
              <div className="w-8 h-8 rounded-lg bg-paper-subtle border border-paper-border flex items-center justify-center text-ink-muted">
                <Briefcase className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <p className="text-3xl font-bold text-ink mt-3 font-serif tracking-tight tabular-nums">
              {opportunities.length}
            </p>
            <p className="text-xs text-ink-muted mt-1">
              {publishedCount} published active roles
            </p>
          </div>
          <Link
            to="/recruiter/opportunities"
            className="text-xs text-verified hover:text-verified-hover font-semibold flex items-center gap-1 mt-4 pt-3 border-t border-paper-border focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified rounded"
          >
            <span>Manage Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="kasumo-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-unverified uppercase tracking-wider">
                Pending Verifications
              </span>
              <div className="w-8 h-8 rounded-lg bg-unverified-light border border-unverified-border flex items-center justify-center text-unverified">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <p className="text-3xl font-bold text-unverified mt-3 font-serif tracking-tight tabular-nums">
              {recentEvidence.length}
            </p>
            <p className="text-xs text-ink-muted mt-1">
              Submissions awaiting your audit
            </p>
          </div>
          <Link
            to="/recruiter/verifications"
            className="text-xs text-unverified hover:text-unverified-hover font-semibold flex items-center gap-1 mt-4 pt-3 border-t border-paper-border focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-unverified rounded"
          >
            <span>Review Audit Queue</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="kasumo-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-verified uppercase tracking-wider">
                Candidate Connections
              </span>
              <div className="w-8 h-8 rounded-lg bg-verified-light border border-verified-border flex items-center justify-center text-verified">
                <Users className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <p className="text-3xl font-bold text-verified mt-3 font-serif tracking-tight tabular-nums">
              {acceptedConnections}
            </p>
            <p className="text-xs text-ink-muted mt-1">
              {pendingConnections} pending requests
            </p>
          </div>
          <Link
            to="/recruiter/connections"
            className="text-xs text-verified hover:text-verified-hover font-semibold flex items-center gap-1 mt-4 pt-3 border-t border-paper-border focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified rounded"
          >
            <span>Candidate Connections</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="kasumo-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                Taxonomy Skills
              </span>
              <div className="w-8 h-8 rounded-lg bg-paper-subtle border border-paper-border flex items-center justify-center text-ink-muted">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <p className="text-3xl font-bold text-ink mt-3 font-serif tracking-tight tabular-nums">
              {skills.length}
            </p>
            <p className="text-xs text-ink-muted mt-1">
              Standardized taxonomy skills
            </p>
          </div>
          <span className="text-xs text-ink-subtle font-mono mt-4 pt-3 border-t border-paper-border">
            Deterministic Rule Matcher
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboardView;
