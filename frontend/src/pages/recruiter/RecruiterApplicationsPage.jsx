import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, CheckCircle2, Clock, XCircle, ChevronDown, ExternalLink, ShieldCheck, Search } from 'lucide-react';
import { Alert } from '../../components/common/Alert';

export const RecruiterApplicationsPage = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [alert, setAlert] = useState({ type: null, message: null });

  const [applications, setApplications] = useState([
    {
      id: 'app-1',
      candidateName: 'Arjun Reddy',
      roleTitle: 'SDE Intern - Backend Developer',
      appliedAt: '2 hours ago',
      evidenceUrl: 'https://github.com/kasumo-demo/distributed-cache',
      assessmentScore: '92% (PASSED)',
      status: 'SHORTLISTED'
    },
    {
      id: 'app-2',
      candidateName: 'Sneha Kumar',
      roleTitle: 'Software Engineer - Java',
      appliedAt: '1 day ago',
      evidenceUrl: 'https://github.com/kasumo-demo/sql-optimizer',
      assessmentScore: '88% (PASSED)',
      status: 'UNDER_REVIEW'
    },
    {
      id: 'app-3',
      candidateName: 'Vikram Das',
      roleTitle: 'SDE Intern - Backend Developer',
      appliedAt: '2 days ago',
      evidenceUrl: 'https://github.com/kasumo-demo/spring-monolith',
      assessmentScore: '95% (PASSED)',
      status: 'INTERVIEWING'
    },
    {
      id: 'app-4',
      candidateName: 'Rahul Varma',
      roleTitle: 'Tech Challenge 2026',
      appliedAt: '3 days ago',
      evidenceUrl: 'https://github.com/kasumo-demo/ml-pipeline',
      assessmentScore: '84% (PASSED)',
      status: 'ACCEPTED'
    }
  ]);

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
        <div className="flex items-center gap-2">
          {['ALL', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEWING', 'ACCEPTED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterStatus === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All Applications' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: null, message: null })} />

      <div className="space-y-3">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs hover:shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {app.candidateName}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-100 dark:border-blue-900/40">
                  {app.roleTitle}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Applied {app.appliedAt}</span>
                </span>
                <span>•</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Assessment: {app.assessmentScore}
                </span>
                <span>•</span>
                <a
                  href={app.evidenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>Verified Repo</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Status Change Selector */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-semibold text-slate-500">Stage:</span>
              <select
                value={app.status}
                onChange={(e) => handleUpdateStatus(app.id, e.target.value, app.candidateName)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
