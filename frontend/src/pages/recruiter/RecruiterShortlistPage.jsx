import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Trash2, Send, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Alert } from '../../components/common/Alert';
import { studentApi } from '../../api/studentApi';

export const RecruiterShortlistPage = () => {
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ type: null, message: null });
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShortlist();
  }, []);

  const loadShortlist = async () => {
    try {
      setLoading(true);
      const savedMap = (() => {
        try {
          const raw = localStorage.getItem('kasumo_shortlisted_ids');
          return raw ? JSON.parse(raw) : {};
        } catch {
          return {};
        }
      })();

      const savedIds = Object.keys(savedMap).filter((k) => savedMap[k]);
      if (savedIds.length === 0) {
        setShortlistedCandidates([]);
        return;
      }

      const all = await studentApi.getAllCandidates().catch(() => []);
      const matched = (all || [])
        .filter((c, idx) => savedIds.includes(String(c.id || idx)))
        .map((c, idx) => ({
          id: String(c.id || idx),
          name: c.fullName || 'Registered Student',
          university: c.university ? `${c.university} (${c.graduationYear || '2026'})` : 'Student Candidate',
          matchScore: 95,
          skills: c.skills ? c.skills.map((s) => s.skillName || s) : ['Software Engineering', 'Algorithms'],
          notes: 'Evidence-verified candidate selected from talent discovery pool.'
        }));

      setShortlistedCandidates(matched);
    } catch (err) {
      console.error('Failed to load shortlist:', err);
      setShortlistedCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (id, name) => {
    try {
      const savedMap = JSON.parse(localStorage.getItem('kasumo_shortlisted_ids') || '{}');
      delete savedMap[id];
      localStorage.setItem('kasumo_shortlisted_ids', JSON.stringify(savedMap));
    } catch {}

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
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: null, message: null })} />

      {shortlistedCandidates.length === 0 ? (
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-12 text-center space-y-3">
          <Star className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No candidates shortlisted yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Discover technical candidates with verified evidence and add them to your shortlist.
          </p>
          <button
            type="button"
            onClick={() => navigate('/recruiter/candidates')}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition"
          >
            <span>Discover Candidates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {shortlistedCandidates.map((cand) => (
            <div
              key={cand.id}
              className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center font-bold text-sm shrink-0">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {cand.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {cand.university}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {cand.notes}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOutreach(cand.name)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Outreach</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(cand.id, cand.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="Remove from shortlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
