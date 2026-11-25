import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Plus, Clock, Users, Award, ExternalLink, Code, Settings } from 'lucide-react';
import { Alert } from '../../components/common/Alert';
import { assessmentApi } from '../../api/assessmentApi';
import { RecruiterAssessmentBuilderModal } from '../../components/recruiter/RecruiterAssessmentBuilderModal';

export const RecruiterAssessmentsPage = () => {
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ type: null, message: null });
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [builderModal, setBuilderModal] = useState({ isOpen: false, assessmentId: null, opportunityId: null });

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const data = await assessmentApi.getAllAssessments().catch(() => []);
      setAssessments(data || []);
    } catch (err) {
      console.error('Failed to load assessments:', err);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBuilder = (assm) => {
    setBuilderModal({ isOpen: true, assessmentId: assm.id, opportunityId: assm.opportunityId });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Technical Screening Assessments</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
              {assessments.length} Blueprints
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review adaptive screening blueprints, evaluate candidates' code submissions, and inspect test case passes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/recruiter/opportunities/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Assessment Blueprint</span>
        </button>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: null, message: null })} />

      {assessments.length === 0 ? (
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-12 text-center space-y-3">
          <CheckSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No screening blueprints created yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            When you post an opportunity with technical screening enabled, automated algorithmic blueprints will appear here.
          </p>
          <button
            type="button"
            onClick={() => navigate('/recruiter/opportunities/new')}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition"
          >
            <span>Post Opportunity with Screening</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assessments.map((assm) => (
            <div
              key={assm.id}
              className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {assm.title || `Assessment #${assm.id}`}
                    </h3>
                    <p className="text-[11px] text-slate-400">Adaptive Algorithm Sandbox</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Time Limit</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {assm.timeLimitMinutes || 45} mins
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Threshold</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {assm.passingScore || 70}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Questions</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {assm.totalQuestions || 5}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenBuilder(assm)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl transition"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Custom Assessment Builder</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {builderModal.isOpen && (
        <RecruiterAssessmentBuilderModal
          isOpen={builderModal.isOpen}
          onClose={() => setBuilderModal({ isOpen: false, assessmentId: null, opportunityId: null })}
          opportunityId={builderModal.opportunityId}
          initialAssessmentId={builderModal.assessmentId}
          onAssessmentUpdated={loadAssessments}
        />
      )}
    </div>
  );
};
