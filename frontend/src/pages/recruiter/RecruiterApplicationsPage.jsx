import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Filter, ExternalLink, CheckCircle2, XCircle, Clock, UserCheck } from 'lucide-react';
import { Alert } from '../../components/common/Alert';
import { opportunityApi } from '../../api/opportunityApi';

export const RecruiterApplicationsPage = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [alert, setAlert] = useState({ type: null, message: null });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const opps = await opportunityApi.getMyOpportunities().catch(() => []);
      const allApps = [];
      (opps || []).forEach((opp) => {
        if (opp.applications && Array.isArray(opp.applications)) {
          opp.applications.forEach((a) => {
            allApps.push({
              id: a.id,
              candidateName: a.candidateName || 'Candidate',
              roleTitle: opp.title,
              appliedAt: a.appliedAt || 'Recent',
              evidenceUrl: a.evidenceUrl || '#',
              assessmentScore: a.assessmentScore || 'N/A',
              status: a.status || 'UNDER_REVIEW'
            });
          });
        }
      });
      setApplications(allApps);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (appId, newStatus, candidateName) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
    setAlert({
      type: 'success',
      message: `Updated status for ${candidateName} to ${newStatus.replace('_', ' ')}.`
    });
  };

  const filteredApps = applications.filter((a) => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Applicant Pipeline</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
              {applications.length} Total
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review candidate proof submissions, technical assessment results, and manage application stages.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-2xs">
          {['ALL', 'UNDER_REVIEW', 'INTERVIEWING', 'ACCEPTED'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {status === 'ALL' ? 'All Applications' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: null, message: null })} />

      {filteredApps.length === 0 ? (
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-12 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No applications received yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            When candidates discover and apply to your published opportunities, their verified applications will appear here.
          </p>
          <button
            type="button"
            onClick={() => navigate('/recruiter/opportunities/new')}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition"
          >
            <span>Post an Opportunity</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Applied Role</th>
                <th className="py-3.5 px-4">Applied</th>
                <th className="py-3.5 px-4">Assessment Result</th>
                <th className="py-3.5 px-4">Current Stage</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {app.candidateName}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {app.roleTitle}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                    {app.appliedAt}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {app.assessmentScore}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      app.status === 'ACCEPTED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : app.status === 'INTERVIEWING'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(app.id, 'INTERVIEWING', app.candidateName)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-lg font-bold text-[11px] transition"
                    >
                      Interview
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(app.id, 'ACCEPTED', app.candidateName)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-lg font-bold text-[11px] transition"
                    >
                      Accept
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
