import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Code, 
  Terminal, 
  Cpu, 
  Layers, 
  Send,
  UserCheck,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { assessmentApi } from '../../api/assessmentApi';

/**
 * CandidateAssessmentModal
 * Comprehensive KASUMO Recruiter Decision Support Modal (Principles #12, #17, #18, #19).
 */
export const CandidateAssessmentModal = ({
  isOpen,
  onClose,
  candidate,
  opportunityId,
  assessmentData,
  loading = false,
  onDecisionUpdated,
  onOpenConnect
}) => {
  const [decisionNotes, setDecisionNotes] = useState('');
  const [savingDecision, setSavingDecision] = useState(false);
  const [activeDecision, setActiveDecision] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  if (!isOpen) return null;

  const currentData = activeDecision ? { ...assessmentData, ...activeDecision } : assessmentData;

  const handleRecordDecision = async (decisionType) => {
    if (!currentData?.attemptId) return;
    try {
      setSavingDecision(true);
      setActionMessage(null);
      const updated = await assessmentApi.recordRecruiterDecision(currentData.attemptId, {
        decision: decisionType,
        notes: decisionNotes
      });
      setActiveDecision(updated);
      setActionMessage(`Decision recorded: ${decisionType.replace(/_/g, ' ')}`);
      if (onDecisionUpdated) {
        onDecisionUpdated(updated);
      }
      if (decisionType === 'CONNECTED' && onOpenConnect && candidate) {
        setTimeout(() => {
          onClose();
          onOpenConnect(candidate);
        }, 600);
      }
    } catch (err) {
      console.error('Failed to record recruiter decision:', err);
      setActionMessage('Failed to record decision.');
    } finally {
      setSavingDecision(false);
    }
  };

  const integrityStatus = currentData?.integrityStatus || 'NORMAL';
  const isReviewRecommended = integrityStatus === 'REVIEW_RECOMMENDED' || integrityStatus === 'STRONG_ANOMALY_PATTERN';

  let integritySignals = null;
  try {
    if (currentData?.integritySignalsJson) {
      integritySignals = typeof currentData.integritySignalsJson === 'string'
        ? JSON.parse(currentData.integritySignalsJson)
        : currentData.integritySignalsJson;
    }
  } catch (e) {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-6 z-10 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                Candidate Technical Verification — #{candidate?.candidateAlias}
              </h3>
              {currentData?.passed ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  VERIFIED ({Math.round(currentData?.percentage || 0)}%)
                </span>
              ) : currentData && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  COMPLETED ({Math.round(currentData?.percentage || 0)}%)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Opportunity: <strong>{currentData?.opportunityTitle || 'Technical Role'}</strong> • Non-punitive evidence verification
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <LoadingSpinner size="lg" text="Retrieving assessment telemetry & deep code analysis..." />
          </div>
        ) : !currentData ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No assessment results available for this candidate.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Self-Assessed vs Demonstrated Level Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Self-Assessed</span>
                  <span className="text-xs font-mono font-bold text-slate-800 uppercase">{currentData.selfAssessmentLevel || 'MEDIUM'}</span>
                </div>
                <div className="text-slate-300">→</div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Demonstrated</span>
                  <span className="text-xs font-mono font-bold text-indigo-700 uppercase">{currentData.demonstratedLevel || currentData.capabilityLevel || 'MEDIUM'}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Difficulty Tested</span>
                <span className="text-xs font-mono font-bold text-slate-800">Equivalent Tier</span>
              </div>
            </div>

            {/* Assessment Integrity Notice Banner (Principle #3, #12) */}
            <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
              isReviewRecommended
                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            }`}>
              {isReviewRecommended ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              )}
              <div className="space-y-1">
                <strong>{isReviewRecommended ? 'Status: REVIEW RECOMMENDED' : 'Status: NORMAL INTEGRITY SIGNALS'}</strong>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {isReviewRecommended
                    ? 'Multiple assessment integrity signals detected. Per KASUMO principles, these are evidence for recruiter inspection—not automatic proof of cheating. Inspect submitted code below.'
                    : 'No significant integrity concerns detected. Focus changes and editing cadence match expected developer behavior.'}
                </p>
                {integritySignals?.observations?.length > 0 && (
                  <ul className="list-disc list-inside text-[11px] space-y-0.5 pt-1">
                    {integritySignals.observations.map((obs, idx) => (
                      <li key={idx}>{obs}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Per-Question Submitted Solutions & Code Analysis */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-indigo-600" />
                <span>Submitted Code & Verified Test Telemetry</span>
              </h4>

              <div className="space-y-3">
                {currentData.questionResults?.map((qr, idx) => {
                  let analysis = null;
                  try {
                    if (qr.codeAnalysisJson) {
                      analysis = typeof qr.codeAnalysisJson === 'string'
                        ? JSON.parse(qr.codeAnalysisJson)
                        : qr.codeAnalysisJson;
                    }
                  } catch (e) {}

                  return (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400 font-bold">#{idx + 1}</span>
                          <span className="font-bold text-slate-900">{qr.title}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                            {qr.skillName} • {qr.difficulty}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-700">
                          {qr.pointsEarned} / {qr.maxPoints} pts
                        </span>
                      </div>

                      {/* Analysis telemetry pill */}
                      {analysis && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-[11px]">
                          <div className="bg-white p-1.5 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[9px] uppercase">Approach</span>
                            <span className="font-bold text-indigo-700 truncate block">{analysis.algorithmicApproach || 'Standard'}</span>
                          </div>
                          <div className="bg-white p-1.5 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[9px] uppercase">Time</span>
                            <span className="font-bold text-slate-800">{analysis.estimatedTimeComplexity || 'O(N)'}</span>
                          </div>
                          <div className="bg-white p-1.5 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[9px] uppercase">Space</span>
                            <span className="font-bold text-slate-800">{analysis.estimatedSpaceComplexity || 'O(1)'}</span>
                          </div>
                          <div className="bg-white p-1.5 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[9px] uppercase">Tests Passed</span>
                            <span className="font-bold text-emerald-700">{qr.testCasesPassed}/{qr.totalTestCases}</span>
                          </div>
                        </div>
                      )}

                      {/* Code preview */}
                      {qr.submittedCode && (
                        <div>
                          <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                            {qr.submittedCode}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recruiter Decision Support Actions (Principle #17) */}
            <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>Recruiter Verification Action</span>
                </span>
                {currentData.recruiterDecision && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-600 text-white uppercase">
                    Current: {currentData.recruiterDecision.replace(/_/g, ' ')}
                  </span>
                )}
              </div>

              <textarea
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Optional recruiter notes or observations regarding candidate's code..."
                className="w-full text-xs p-2.5 rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                rows="2"
              />

              {actionMessage && (
                <p className="text-xs text-indigo-700 font-semibold">{actionMessage}</p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={savingDecision}
                  onClick={() => handleRecordDecision('VERIFIED')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  [ Verify Candidate ]
                </button>

                <button
                  type="button"
                  disabled={savingDecision}
                  onClick={() => handleRecordDecision('REQUEST_ADDITIONAL_ASSESSMENT')}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  [ Request Additional Assessment ]
                </button>

                <button
                  type="button"
                  disabled={savingDecision}
                  onClick={() => handleRecordDecision('CONNECTED')}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  [ Connect ]
                </button>

                <button
                  type="button"
                  disabled={savingDecision}
                  onClick={() => handleRecordDecision('ARCHIVED')}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition disabled:opacity-50"
                >
                  [ Archive / Pass ]
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
