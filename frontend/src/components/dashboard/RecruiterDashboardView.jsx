import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Plus,
  Eye,
  TrendingUp,
  Search,
  Building
} from 'lucide-react';

export const RecruiterDashboardView = ({
  user,
  opportunities = [],
  recentEvidence = [],
  connections = [],
  greeting = 'Good Morning'
}) => {
  const navigate = useNavigate();
  const publishedCount = opportunities.filter((o) => o.status === 'PUBLISHED').length;
  const activeConnectionsCount = connections.filter((c) => c.status === 'ACCEPTED').length;

  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      {/* 1. Recruiter Workspace Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0a1224] via-[#0f1d3d] to-[#142650] border border-blue-900/30 p-6 sm:p-7 text-white shadow-sm overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Verified Employer Portal
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {user?.organizationName || 'Acme Engineering'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Recruiter Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-normal max-w-xl">
            Evaluate candidate proof, publish screening blueprints, and connect with verified technical talent.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/recruiter/opportunities/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-full transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Opportunity</span>
            </button>
            <Link
              to="/recruiter/verifications"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 hover:border-white text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition backdrop-blur-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Verification Queue</span>
            </Link>
          </div>
        </div>

        {/* Right Stats Quick View */}
        <div className="z-10 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 text-center min-w-[200px] space-y-1">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
            Institutional Audit
          </span>
          <div className="text-2xl font-black text-white">
            {recentEvidence.length} Pending
          </div>
          <p className="text-[11px] text-slate-300">
            Awaiting verification review
          </p>
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Roles */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Roles
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-sans">
            {publishedCount}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>{opportunities.length} total drafts & published</span>
            <Link to="/recruiter/opportunities" className="text-blue-600 font-bold hover:underline">View</Link>
          </div>
        </div>

        {/* Verification Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Verification Queue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-sans">
            {recentEvidence.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Student proof submissions</span>
            <Link to="/recruiter/verifications" className="text-emerald-600 font-bold hover:underline">Audit</Link>
          </div>
        </div>

        {/* Connections */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Consented Candidates
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-sans">
            {activeConnectionsCount}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Disclosed direct profiles</span>
            <Link to="/recruiter/connections" className="text-purple-600 font-bold hover:underline">Review</Link>
          </div>
        </div>

        {/* Talent Footprint */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Candidate Proof Pool
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-sans">
            2,847
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-emerald-600 font-bold">↑ 12% vs last month</span>
            <Link to="/recruiter/opportunities" className="text-amber-600 font-bold hover:underline">Match</Link>
          </div>
        </div>
      </div>

      {/* 3. Top Candidates & Recent Opportunities Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Active Opportunities */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Active Opportunities ({opportunities.length})
              </h3>
            </div>
            <Link to="/recruiter/opportunities/new" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
            </Link>
          </div>

          {opportunities.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No opportunities created yet. Click "Create Opportunity" to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {opportunities.slice(0, 4).map((opp) => (
                <div
                  key={opp.id}
                  onClick={() => navigate(`/recruiter/opportunities/${opp.id}`)}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition cursor-pointer flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {opp.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                        {opp.type} • {opp.workType}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        {opp.status}
                      </span>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-200/70 flex items-center justify-center text-slate-600">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verification Audit Queue */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Pending Verification Audits ({recentEvidence.length})
              </h3>
            </div>
            <Link to="/recruiter/verifications" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentEvidence.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Your organization's verification queue is clear. No pending student audits.
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvidence.slice(0, 4).map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => navigate('/recruiter/verifications')}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-emerald-400 bg-slate-50/50 hover:bg-white transition cursor-pointer flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {ev.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-sm">
                      {ev.skillName} • {ev.evidenceType}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                    Audit Now
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboardView;
