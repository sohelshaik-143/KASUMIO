import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Code, 
  UserCheck
} from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { assessmentApi } from '../../api/assessmentApi';
import { Modal } from '../common/Modal';

/**
 * CandidateAssessmentModal
 * Comprehensive Recruiter Decision Support Modal with verification telemetry.
 */
export const CandidateAssessmentModal = ({
  isOpen,
  onClose,
  candidate,
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
      setActionMessage(err.response?.data?.message || 'Failed to record decision. Please retry.');
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
  } catch (_) {}

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Candidate Verification — #${candidate?.candidateAlias || 'Anonymous'}`}
      description={`Opportunity: ${currentData?.opportunityTitle || 'Technical Role'} • Evidence-backed review`}
      maxWidth="max-w-3xl"
    >
      {loading ? (
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" text="Retrieving assessment telemetry & deep code analysis..." />
        </div>
      ) : !currentData ? (
        <div className="py-8 text-center text-sm text-slate-500">
          No assessment results available for this candidate.
        </div>
      ) : (
        <div className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">
          {/* Level banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="uppercase font-bold text-slate-500 block tracking-wider">Self-Assessed</span>
                <span className="font-mono font-bold text-slate-900 uppercase">{currentData.selfAssessmentLevel || 'MEDIUM'}</span>
              </div>
              <span className="text-slate-400 font-bold" aria-hidden="true">→</span>
              <div>
                <span className="uppercase font-bold text-slate-500 block tracking-wider">Demonstrated</span>
                <span className="font-mono font-bold text-teal-800 uppercase">{currentData.demonstratedLevel || currentData.capabilityLevel || 'MEDIUM'}</span>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="uppercase font-bold text-slate-500 block tracking-wider">Score</span>
              <span className="font-mono font-bold text-teal-800">{Math.round(currentData.percentage || 0)}%</span>
            </div>
          </div>

          {/* Assessment Integrity Notice */}
          <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
            isReviewRecommended
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-teal-50 border-teal-200 text-teal-950'
          }`}>
            {isReviewRecommended ? (
              <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-teal-700 mt-0.5 shrink-0" aria-hidden="true" />
            )}
            <div className="space-y-1">
              <strong>{isReviewRecommended ? 'Status: REVIEW RECOMMENDED' : 'Status: NORMAL INTEGRITY SIGNALS'}</strong>
              <p className="leading-relaxed">
                {isReviewRecommended
                  ? 'Multiple assessment integrity signals detected. Per KASUMIO principles, these are evidence for recruiter inspection—not automatic proof of misconduct.'
                  : 'No significant integrity concerns detected. Focus changes and editing cadence match expected developer behavior.'}
              </p>
              {integritySignals?.observations?.length > 0 && (
                <ul className="list-disc list-inside space-y-0.5 pt-1">
                  {integritySignals.observations.map((obs, idx) => (
                    <li key={idx}>{obs}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Per-Question Submitted Solutions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-4 h-4 text-teal-700" aria-hidden="true" />
              <span>Submitted Code & Verified Test Telemetry</span>
            </h3>

            <div className="space-y-3">
              {currentData.questionResults?.map((qr, idx) => {
                let analysis = null;
                try {
                  if (qr.codeAnalysisJson) {
                    analysis = typeof qr.codeAnalysisJson === 'string'
                      ? JSON.parse(qr.codeAnalysisJson)
                      : qr.codeAnalysisJson;
                  }
                } catch (_) {}

                let evalLayers = null;
                try {
                  if (qr.evaluationLayersJson) {
                    evalLayers = typeof qr.evaluationLayersJson === 'string'
                      ? JSON.parse(qr.evaluationLayersJson)
                      : qr.evaluationLayersJson;
                  }
                } catch (_) {}

                return (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 font-bold">#{idx + 1}</span>
                        <span className="font-bold text-slate-900">{qr.title}</span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                          {qr.skillName} • {qr.difficulty}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-800">
                        {qr.pointsEarned} / {qr.maxPoints} pts
                      </span>
                    </div>

                    {/* AI Advisory Layer Insights */}
                    {evalLayers?.layer3AiSuggestions && (
                      <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span>AI Advisory Evaluation:</span>
                          <span className="text-teal-800 font-mono">Suggested: {evalLayers.layer3AiSuggestions.suggestedScore} pts</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          {evalLayers.layer3AiSuggestions.explanation}
                        </p>
                      </div>
                    )}

                    {analysis && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs">
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-slate-500 block uppercase font-medium">Approach</span>
                          <span className="font-bold text-teal-800 truncate block">{analysis.algorithmicApproach || 'Standard'}</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-slate-500 block uppercase font-medium">Time</span>
                          <span className="font-bold text-slate-800">{analysis.estimatedTimeComplexity || 'O(N)'}</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-slate-500 block uppercase font-medium">Space</span>
                          <span className="font-bold text-slate-800">{analysis.estimatedSpaceComplexity || 'O(1)'}</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-slate-500 block uppercase font-medium">Tests</span>
                          <span className="font-bold text-teal-800">{qr.testCasesPassed}/{qr.totalTestCases}</span>
                        </div>
                      </div>
                    )}

                    {qr.submittedCode && (
                      <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs overflow-x-auto max-h-48 leading-relaxed">
                        {qr.submittedCode}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recruiter Decision Actions */}
          <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-teal-700" aria-hidden="true" />
                <span>Recruiter Verification Action</span>
              </span>
              {currentData.recruiterDecision && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-800 text-white uppercase">
                  {currentData.recruiterDecision.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            <textarea
              aria-label="Recruiter decision notes"
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder="Optional recruiter notes or observations regarding candidate's code..."
              className="w-full text-xs p-2.5 rounded-lg border border-teal-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              rows={2}
            />

            {actionMessage && (
              <p role="status" className="text-xs text-teal-900 font-semibold">{actionMessage}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                disabled={savingDecision}
                onClick={() => handleRecordDecision('VERIFIED')}
                className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg transition shadow-xs disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                Verify Candidate
              </button>

              <button
                type="button"
                disabled={savingDecision}
                onClick={() => handleRecordDecision('REQUEST_ADDITIONAL_ASSESSMENT')}
                className="px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition shadow-xs disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-600"
              >
                Request Additional Assessment
              </button>

              <button
                type="button"
                disabled={savingDecision}
                onClick={() => handleRecordDecision('CONNECTED')}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition shadow-xs disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-700"
              >
                Connect
              </button>

              <button
                type="button"
                disabled={savingDecision}
                onClick={() => handleRecordDecision('ARCHIVED')}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg transition disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 bg-white border border-slate-300 rounded-lg transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default CandidateAssessmentModal;
