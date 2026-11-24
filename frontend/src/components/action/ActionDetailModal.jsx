import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Layers, ShieldCheck, MessageSquare, Briefcase, Zap } from 'lucide-react';
import actionApi from '../../api/actionApi';
import { Modal } from '../common/Modal';

export const ActionDetailModal = ({ actionId, onClose, onActionUpdated }) => {
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackText] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [, setSelectedFeedbackType] = useState(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [actionStarted, setActionStarted] = useState(false);

  useEffect(() => {
    if (!actionId) return;
    const loadDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await actionApi.getActionDetails(actionId);
        setDetail(data);
      } catch (err) {
        console.error('Failed to load action detail', err);
        setError('Failed to load action guidance.');
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [actionId]);

  const handleStartAction = async () => {
    try {
      await actionApi.startAction(actionId);
      setActionStarted(true);
      if (onActionUpdated) onActionUpdated();
    } catch (err) {
      console.error('Failed to start action', err);
      setError(err.response?.data?.message || 'Failed to start action. Please try again.');
    }
  };

  const handleAddEvidence = () => {
    onClose();
    navigate('/evidence', { state: { targetSkill: detail?.capabilityStrengthened } });
  };

  const handleFeedbackSubmit = async (type) => {
    try {
      setSelectedFeedbackType(type);
      setSubmittingFeedback(true);
      await actionApi.submitFeedback(actionId, type, feedbackText);
      setFeedbackSuccess(true);
      if (onActionUpdated) onActionUpdated();
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Failed to submit feedback', err);
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (!actionId) return null;

  const flow = detail?.visualFlow;

  return (
    <Modal
      isOpen={Boolean(actionId)}
      onClose={onClose}
      title={detail?.title || 'Action Guidance'}
      description={detail?.description}
    >
      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading guidance details...</div>
      ) : error ? (
        <div className="py-12 text-center text-sm text-rose-600 font-medium">{error}</div>
      ) : detail ? (
        <div className="space-y-5">
          {/* Metadata banner */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg p-2.5">
            <span className="uppercase tracking-wider">Action Guidance</span>
            <span>•</span>
            <span className="text-teal-900">Evidence ROI: {detail.evidenceRoi}</span>
            <span>•</span>
            <span className="text-slate-600">Effort: {detail.estimatedEffort}</span>
          </div>

          {/* Visual Roadmap Flow */}
          {flow && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Growth Trajectory
              </p>
              <div className="flex items-center justify-between text-xs text-slate-700 gap-2 overflow-x-auto">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shrink-0 text-center shadow-xs">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Current</div>
                  <div className="font-medium text-slate-800 mt-0.5">{flow.currentTech || 'Active Base'}</div>
                </div>
                <span className="text-slate-400 font-bold" aria-hidden="true">→</span>
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 shrink-0 text-center shadow-xs">
                  <div className="text-xs text-amber-800 uppercase font-semibold">Requirement Gap</div>
                  <div className="font-semibold text-amber-900 mt-0.5">{flow.gapTech}</div>
                </div>
                <span className="text-slate-400 font-bold" aria-hidden="true">→</span>
                <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 shrink-0 text-center shadow-xs">
                  <div className="text-xs text-teal-800 uppercase font-semibold">Target Evidence</div>
                  <div className="font-semibold text-teal-900 mt-0.5">{detail.capabilityStrengthened}</div>
                </div>
                <span className="text-slate-400 font-bold" aria-hidden="true">→</span>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 shrink-0 text-center shadow-xs">
                  <div className="text-xs text-emerald-800 uppercase font-semibold">Target Outcome</div>
                  <div className="font-semibold text-emerald-900 mt-0.5">{flow.targetOutcome}</div>
                </div>
              </div>
            </div>
          )}

          {/* Why It Matters */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Zap className="w-4 h-4 text-amber-700" aria-hidden="true" />
              Why this matters for your career
            </div>
            <p className="text-sm text-slate-800 leading-relaxed">{detail.whyItMatters}</p>
          </div>

          {/* Execution Steps */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Recommended Implementation Steps
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 whitespace-pre-line leading-relaxed font-mono">
              {detail.whatToDo}
            </div>
          </div>

          {/* Reused Project & Capability Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {detail.reusedProject && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
                  <Layers className="w-4 h-4 text-teal-700" aria-hidden="true" />
                  Reused Base Project
                </div>
                <div className="text-sm font-semibold text-slate-900 truncate">{detail.reusedProject}</div>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
                <ShieldCheck className="w-4 h-4 text-teal-700" aria-hidden="true" />
                Capability Strengthened
              </div>
              <div className="text-sm font-semibold text-slate-900">{detail.capabilityStrengthened}</div>
            </div>
          </div>

          {/* Success Criteria */}
          {detail.successCriteria && (
            <div className="border-t border-slate-200 pt-3">
              <h3 className="text-xs font-bold text-slate-700 mb-1">Definition of Done</h3>
              <p className="text-sm text-slate-600">{detail.successCriteria}</p>
            </div>
          )}

          {/* Targeted Opportunities */}
          {detail.targetedOpportunities && detail.targetedOpportunities.length > 0 && (
            <div className="border-t border-slate-200 pt-3">
              <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-teal-700" aria-hidden="true" />
                Opportunities this move unlocks
              </h3>
              <ul className="space-y-1.5">
                {detail.targetedOpportunities.map((opp, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600" aria-hidden="true" />
                    {opp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions & Evidence Linking */}
          <div className="border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {!actionStarted ? (
                <button
                  type="button"
                  onClick={handleStartAction}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm rounded-lg shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                >
                  Start Action
                </button>
              ) : (
                <span className="text-sm font-medium text-teal-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" aria-hidden="true" /> Action Started
                </span>
              )}

              <button
                type="button"
                onClick={handleAddEvidence}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg shadow-xs transition flex items-center gap-1.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2"
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                Add Evidence
              </button>
            </div>

            {/* Feedback toggle */}
            <button
              type="button"
              onClick={() => setShowFeedbackInput(!showFeedbackInput)}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 rounded px-1"
            >
              <MessageSquare className="w-4 h-4 text-slate-500" aria-hidden="true" />
              Provide Feedback
            </button>
          </div>

          {/* Feedback Input Panel */}
          {showFeedbackInput && !feedbackSuccess && (
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
              <p className="text-xs font-semibold text-slate-800">Was this recommendation useful?</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Already know this', type: 'ALREADY_KNOW' },
                  { label: 'Not relevant to my goal', type: 'WRONG_GOAL' },
                  { label: 'Too difficult', type: 'TOO_DIFFICULT' },
                  { label: 'Already completed', type: 'ALREADY_COMPLETED' },
                  { label: 'Not interested', type: 'NOT_INTERESTED' },
                  { label: 'Other', type: 'OTHER' }
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleFeedbackSubmit(item.type)}
                    disabled={submittingFeedback}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {feedbackSuccess && (
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl text-center font-medium">
              Thank you. Your feedback updates your personal recommendations without altering global intelligence.
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
};

export default ActionDetailModal;
