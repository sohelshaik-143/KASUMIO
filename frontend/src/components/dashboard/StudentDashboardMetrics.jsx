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
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-indigo-200 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Proof Items</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <p className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">{totalEvidence}</p>
        <p className="text-xs text-slate-500 mt-1">Direct portfolio submissions</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-emerald-200 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Proof</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <p className="text-3xl font-extrabold text-emerald-600 mt-3 tracking-tight">{verifiedEvidence}</p>
        <p className="text-xs text-slate-500 mt-1">Attested by accredited institutions</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-indigo-200 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Career Goals</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <p className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">{careerGoalsCount}</p>
        <p className="text-xs text-slate-500 mt-1">Target role goals defined</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recruiter Network</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-indigo-600 mt-3 tracking-tight">{activeConnectionsCount}</p>
          <p className="text-xs text-slate-500 mt-1">Active recruiter connections</p>
        </div>
        <Link
          to="/student/connections"
          className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 mt-3 pt-2 border-t border-slate-100"
        >
          <span>Manage Connections</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
