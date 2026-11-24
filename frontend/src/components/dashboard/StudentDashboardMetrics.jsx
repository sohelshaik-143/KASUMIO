import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Target, Users, ArrowRight } from 'lucide-react';

/**
 * Metric cards summarizing student proof items, verified credentials, goals, and network.
 */
export const StudentDashboardMetrics = ({
  totalEvidence = 0,
  verifiedEvidence = 0,
  careerGoalsCount = 0,
  activeConnectionsCount = 0,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="kasumo-card p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Total Proof Items</span>
            <div className="w-8 h-8 rounded-lg bg-paper-subtle border border-paper-border flex items-center justify-center text-ink-muted">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <p className="text-3xl font-bold text-ink mt-3 font-serif tracking-tight tabular-nums">{totalEvidence}</p>
          <p className="text-xs text-ink-muted mt-1">Direct portfolio submissions</p>
        </div>
      </div>

      <div className="kasumo-card p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-verified uppercase tracking-wider">Verified Proof</span>
            <div className="w-8 h-8 rounded-lg bg-verified-light border border-verified-border flex items-center justify-center text-verified">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <p className="text-3xl font-bold text-verified mt-3 font-serif tracking-tight tabular-nums">{verifiedEvidence}</p>
          <p className="text-xs text-ink-muted mt-1">Attested by accredited institutions</p>
        </div>
      </div>

      <div className="kasumo-card p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Career Goals</span>
            <div className="w-8 h-8 rounded-lg bg-paper-subtle border border-paper-border flex items-center justify-center text-ink-muted">
              <Target className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <p className="text-3xl font-bold text-ink mt-3 font-serif tracking-tight tabular-nums">{careerGoalsCount}</p>
          <p className="text-xs text-ink-muted mt-1">Target role goals defined</p>
        </div>
      </div>

      <div className="kasumo-card p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Recruiter Network</span>
            <div className="w-8 h-8 rounded-lg bg-paper-subtle border border-paper-border flex items-center justify-center text-verified">
              <Users className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <p className="text-3xl font-bold text-ink mt-3 font-serif tracking-tight tabular-nums">{activeConnectionsCount}</p>
          <p className="text-xs text-ink-muted mt-1">Active recruiter connections</p>
        </div>
        <Link
          to="/student/connections"
          className="text-xs text-verified hover:text-verified-hover font-semibold flex items-center gap-1 mt-3 pt-2 border-t border-paper-border focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified rounded"
        >
          <span>Manage Connections</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboardMetrics;
