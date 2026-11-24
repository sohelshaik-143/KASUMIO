import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Trash2, Send, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Alert } from '../../components/common/Alert';

export const RecruiterShortlistPage = () => {
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ type: null, message: null });

  const [shortlistedCandidates, setShortlistedCandidates] = useState(() => {
    return [
      {
        id: 'cand-1',
        name: 'Arjun Reddy',
        university: 'IIIT RGUKT • B.Tech CSE (2025)',
        matchScore: 96,
        skills: ['Java', 'Spring Boot', 'AWS Cloud'],
        notes: 'High architectural problem-solving score. Fast learner with published GitHub microservices portfolio.'
      },
      {
        id: 'cand-2',
        name: 'Sneha Kumar',
        university: 'RGUKT IIIT • Computer Science (2026)',
        matchScore: 94,
        skills: ['Java', 'Python', 'System Design'],
        notes: 'Exceptional test suite reliability. Candidate demonstrates strong database optimization.'
      }
    ];
  });

  const handleRemove = (id, name) => {
    setShortlistedCandidates((prev) => prev.filter((c) => c.id !== id));
    setAlert({ type: 'info', message: `${name} removed from your shortlist.` });
  };

  const handleOutreach = (name) => {
    setAlert({ type: 'success', message: `Interview invitation sent to ${name}.` });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Shortlisted Candidates</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold">
              {shortlistedCandidates.length} Saved
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track and engage candidates who demonstrated high proof fidelity and skill alignment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/recruiter/candidates')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <span>Find More Candidates</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: null, message: null })} />

      <div className="space-y-4">
        {shortlistedCandidates.map((cand) => (
          <div
            key={cand.id}
            className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs hover:shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                {cand.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {cand.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                    <ShieldCheck className="w-3 h-3" />
                    {cand.matchScore}% Match
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {cand.university}
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  {cand.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-semibold border border-blue-100 dark:border-blue-900/40"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1">
                  "{cand.notes}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={() => handleOutreach(cand.name)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Invite to Interview</span>
              </button>
              <button
                type="button"
                onClick={() => handleRemove(cand.id, cand.name)}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition border border-slate-200 dark:border-slate-800"
                title="Remove from shortlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {shortlistedCandidates.length === 0 && (
          <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-12 text-center space-y-3">
            <Star className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Your shortlist is currently empty
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Browse candidate profiles and click the star icon to save high-performing candidates here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
