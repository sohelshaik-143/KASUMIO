import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import { opportunityApi } from '../../api/opportunityApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { PreAssessmentTransparencyModal } from '../../components/assessment/PreAssessmentTransparencyModal';
import {
  Code,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Award,
  Terminal
} from 'lucide-react';

export const AssessmentsListPage = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState(null);
  const [agentRunningId, setAgentRunningId] = useState(null);
  const [alert, setAlert] = useState({ type: null, message: null });
  const [selectedAssessmentForModal, setSelectedAssessmentForModal] = useState(null);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      // Fetch all opportunities and their assessments
      const opps = await opportunityApi.getStudentOpportunities().catch(() => []);
      const assessmentList = [];

      for (const opp of opps) {
        try {
          const assm = await assessmentApi.getAssessmentForOpportunity(opp.id);
          if (assm) {
            assessmentList.push({
              ...assm,
              opportunityCompany: opp.companyName,
              hasExpressedInterest: opp.hasExpressedInterest,
              matchScore: opp.matchScore,
              skills: opp.skills || []
            });
          }
        } catch (e) {
          // No assessment or skipped
        }
      }

      // If no student opps returned, fetch global assessments
      if (assessmentList.length === 0) {
        const globals = await assessmentApi.getAllAssessments().catch(() => []);
        setAssessments(globals);
      } else {
        setAssessments(assessmentList);
      }
    } catch (err) {
      console.error('Failed to load assessments:', err);
      setAlert({ type: 'error', message: 'Could not retrieve technical assessments.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateStart = (assessment) => {
    setSelectedAssessmentForModal(assessment);
  };

  const handleConfirmStartAttempt = async (startPayload) => {
    if (!selectedAssessmentForModal) return;
    try {
      setStartingId(selectedAssessmentForModal.id);
      const attempt = await assessmentApi.startAttempt(selectedAssessmentForModal.id, startPayload);
      setSelectedAssessmentForModal(null);
      navigate(`/student/assessments/${selectedAssessmentForModal.id}/attempts/${attempt.id}`);
    } catch (err) {
      console.error('Failed to start assessment:', err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to start technical assessment.'
      });
    } finally {
      setStartingId(null);
    }
  };

  const handleAgentTakeAssessment = async (assessmentId) => {
    try {
      setAgentRunningId(assessmentId);
      setAlert({
        type: 'info',
        message: '🤖 AI Agent is autonomously solving technical & LeetCode DSA questions...'
      });
      const result = await assessmentApi.agentTakeAssessment(assessmentId);
      setAlert({
        type: 'success',
        message: `🤖 AI Agent completed screening! Scored ${result.score}% (${result.status}). Capability verified and evidence minted!`
      });
      setTimeout(() => {
        if (result.attemptId) {
          navigate(`/student/assessments/${assessmentId}/attempts/${result.attemptId}/result`);
        }
      }, 1500);
    } catch (err) {
      console.error('Failed to run agent assessment:', err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Agent screening execution encountered an issue.'
      });
    } finally {
      setAgentRunningId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSpinner size="lg" text="Loading technical screening assessments..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Technical Screening Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Demonstrate Your Engineering Capability
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Take opportunity-tailored Round-1 technical screenings. Solve multi-language programming problems, debug live concurrency bugs, and write real SQL queries. Passed screenings automatically mint verified evidence into your profile portfolio.
          </p>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {/* Assessment List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <span>Available Technical Screenings ({assessments.length})</span>
          </div>
          <Link
            to="/leaderboard"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
          >
            <Award className="w-3.5 h-3.5" />
            <span>View Public Leaderboard</span>
          </Link>
        </div>

        {assessments.length === 0 ? (
          <EmptyState
            icon={Code}
            title="No active screenings available right now"
            description="When recruiters publish opportunities aligned with your demonstrated capabilities, Round-1 technical screenings will appear here automatically."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {assessments.map((assm) => (
              <div
                key={assm.id}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                        {assm.opportunityTitle || 'Software Role'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-1">
                        {assm.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{assm.timeLimitMinutes} mins</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {assm.description}
                  </p>

                  {/* Skills/Competencies badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {assm.questions?.map((q, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80 flex items-center gap-1"
                      >
                        {q.questionType === 'CODING' && <Code className="w-3 h-3 text-indigo-600" />}
                        {q.questionType === 'DEBUGGING' && <Cpu className="w-3 h-3 text-amber-600" />}
                        {q.questionType === 'SQL' && <Layers className="w-3 h-3 text-emerald-600" />}
                        <span>{q.skillName || q.title}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer with Details & Action Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <p>
                      <strong>{assm.totalQuestions || 4}</strong> Questions • Passing: <strong>{assm.passingScore}%</strong>
                    </p>
                    <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Adaptive Multi-Language Sandbox</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAgentTakeAssessment(assm.id)}
                      disabled={agentRunningId === assm.id || startingId === assm.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                      title="Run autonomous AI Agent to solve Round-1 technical & LeetCode problems"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                      <span>{agentRunningId === assm.id ? 'Solving...' : '🤖 AI Agent Take'}</span>
                    </button>

                    <button
                      onClick={() => handleInitiateStart(assm)}
                      disabled={startingId === assm.id || agentRunningId === assm.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                    >
                      {startingId === assm.id ? (
                        <span>Initializing...</span>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Take Test</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PreAssessmentTransparencyModal
        isOpen={Boolean(selectedAssessmentForModal)}
        onClose={() => setSelectedAssessmentForModal(null)}
        onConfirmStart={handleConfirmStartAttempt}
        assessmentTitle={selectedAssessmentForModal?.title}
        opportunityTitle={selectedAssessmentForModal?.opportunityTitle}
        starting={Boolean(startingId)}
      />
    </div>
  );
};
