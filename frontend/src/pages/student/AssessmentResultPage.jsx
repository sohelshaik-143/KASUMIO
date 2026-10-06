import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { CandidateEvidenceProfileCard } from '../../components/assessment/CandidateEvidenceProfileCard';
import { AssessmentIntegritySignalsCard } from '../../components/assessment/AssessmentIntegritySignalsCard';
import { QuestionDiagnosticAccordionItem } from '../../components/assessment/QuestionDiagnosticAccordionItem';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Code,
  Layers,
  Sparkles,
  TrendingUp,
  Cpu
} from 'lucide-react';

export const AssessmentResultPage = () => {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: null, message: null });
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await assessmentApi.getAttemptResult(attemptId);
        setResult(data);
      } catch (err) {
        console.error('Failed to load assessment result:', err);
        setAlert({
          type: 'error',
          message: err.response?.data?.message || 'Could not retrieve assessment evaluation.'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <LoadingSpinner size="lg" text="Synthesizing evaluation results & capability telemetry..." />
      </div>
    );
  }

  if (!result) return null;

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {/* Hero Outcome Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                Screening Evaluation
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${result.passed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
              >
                {result.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>{result.passed ? 'PASSED SCREENING' : 'ATTEMPT COMPLETED'}</span>
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900">
              {result.assessmentTitle}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Target Opportunity: <strong>{result.opportunityTitle}</strong>
            </p>
          </div>

          {/* Score telemetry box */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 px-6 rounded-2xl border border-slate-200 shrink-0">
            <div className="text-center pr-4 border-r border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Score</span>
              <p className="text-2xl font-black text-slate-900 font-mono">
                {result.score}<span className="text-sm font-normal text-slate-400">/{result.maxScore}</span>
              </p>
            </div>
            <div className="text-center pr-4 border-r border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Accuracy</span>
              <p className="text-2xl font-black text-indigo-600 font-mono">
                {Math.round(result.percentage)}%
              </p>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Capability</span>
              <p className="text-sm font-bold text-slate-800 font-mono uppercase mt-1">
                {result.capabilityLevel}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Summary Banner */}
        <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Demonstrated Capability Summary</span>
          </div>
          <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed">
            {result.feedbackSummary}
          </p>
        </div>

        {/* Verified Evidence Minted Notice */}
        {result.passed && (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs text-emerald-950">
                <strong>Verified Assessment Evidence Added</strong>
                <p className="text-[11px] text-emerald-800">
                  This screening is now a verified portfolio credential visible to matching recruiters.
                </p>
              </div>
            </div>
            <Link
              to="/evidence"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-4 shrink-0"
            >
              View Evidence
            </Link>
          </div>
        )}
      </div>

      {/* KASUMO Evidence Profile & Self-Assessment Comparison (Principle #5, #15, #16) */}
      <CandidateEvidenceProfileCard
        selfAssessmentLevel={result.selfAssessmentLevel}
        demonstratedLevel={result.demonstratedLevel || result.capabilityLevel}
        evidenceGraphJson={result.evidenceGraphJson}
        questionResults={result.questionResults || []}
      />

      {/* Non-Punitive Assessment Integrity Signals (Principle #1, #2, #3, #11, #12) */}
      <AssessmentIntegritySignalsCard
        integrityStatus={result.integrityStatus}
        integritySignalsJson={result.integritySignalsJson}
      />

      {/* Detailed Per-Question Feedback Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Code className="w-4 h-4 text-indigo-600" />
          <span>Question-by-Question Diagnostic Feedback ({result.questionResults?.length})</span>
        </h3>

        <div className="space-y-3">
          {result.questionResults?.map((item, idx) => (
            <QuestionDiagnosticAccordionItem
              key={idx}
              item={item}
              isExpanded={expandedIndex === idx}
              onToggle={() => toggleExpand(idx)}
            />
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 flex items-center justify-between">
        <Link
          to="/student/opportunities"
          className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition"
        >
          Back to Opportunities
        </Link>
        <Link
          to="/leaderboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <span>View Capability Leaderboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
