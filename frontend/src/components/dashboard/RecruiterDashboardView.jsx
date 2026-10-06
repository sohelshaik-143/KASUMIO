import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShieldCheck, Briefcase, ArrowRight, Users, Sparkles } from 'lucide-react';

/**
 * Recruiter & Admin Dashboard View
 * Displays institutional verifier overview, published roles, and pending audit requests.
 */
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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {greeting}, {user?.fullName || user?.email?.split('@')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Affiliation:{' '}
            <span className="text-indigo-700 font-semibold">
              {user?.organizationName || 'Accredited Reviewer'}
            </span>{' '}
            • Verifier Portal
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/recruiter/opportunities/new"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Create Opportunity</span>
          </Link>
          <Link
            to="/recruiter/verifications"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Verification Queue</span>
          </Link>
        </div>
      </div>

      {/* Real Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs hover:border-indigo-200 transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Role Opportunities
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
              {opportunities.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {publishedCount} published active roles
            </p>
          </div>
          <Link
            to="/recruiter/opportunities"
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 mt-4 pt-3 border-t border-slate-100"
          >
            <span>Manage Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs hover:border-amber-200 transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pending Verifications
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-amber-600 mt-3 tracking-tight">
              {recentEvidence.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Proof submissions awaiting verification
            </p>
          </div>
          <Link
            to="/recruiter/verifications"
            className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 mt-4 pt-3 border-t border-slate-100"
          >
            <span>Review Audit Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs hover:border-emerald-200 transition">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Candidate Connections
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-emerald-600 mt-3 tracking-tight">
              {acceptedConnections}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {pendingConnections} pending consent requests
            </p>
          </div>
          <Link
            to="/recruiter/connections"
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 mt-4 pt-3 border-t border-slate-100"
          >
            <span>Candidate Connections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Taxonomy Skills
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-indigo-600 mt-3 tracking-tight">
              {skills.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Standardized skills across taxonomy
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-4 pt-3 border-t border-slate-100">
            Deterministic Evidence Matcher
          </span>
        </div>
      </div>
    </div>
  );
};
