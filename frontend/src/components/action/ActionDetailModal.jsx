import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2, Layers, ShieldCheck, MessageSquare, Briefcase, Zap, AlertCircle, ArrowRight } from 'lucide-react';
import actionApi from '../../api/actionApi';

export const ActionDetailModal = ({ actionId, onClose, onActionUpdated }) => {
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [selectedFeedbackType, setSelectedFeedbackType] = useState(null);
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
    }
  };

  const handleAddEvidence = () => {
    onClose();
    // Navigate to evidence portfolio with pre-selected target skill hint
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
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (!actionId) return null;

  const flow = detail?.visualFlow;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-xl relative my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading guidance details...</div>
        ) : error ? (
          <div className="py-12 text-center text-xs text-rose-400">{error}</div>
        ) : detail ? (
          <div className="space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">
                <span>Action Guidance</span>
                <span>•</span>
                <span className="text-emerald-400">Evidence ROI: {detail.evidenceRoi}</span>
                <span>•</span>
                <span className="text-slate-400">Effort: {detail.estimatedEffort}</span>
              </div>
              <h2 className="text-lg font-semibold text-white tracking-tight">{detail.title}</h2>
              <p className="text-xs text-slate-300 mt-1">{detail.description}</p>
            </div>

            {/* Visual Roadmap Flow */}
            {flow && (
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Growth Trajectory
                </p>
                <div className="flex items-center justify-between text-xs text-slate-300 gap-2 overflow-x-auto">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 shrink-0 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Current</div>
                    <div className="font-medium text-slate-200 mt-0.5">{flow.currentTech || 'Active Base'}</div>
                  </div>
                  <span className="text-slate-600">→</span>
                  <div className="p-2 rounded bg-slate-900 border border-amber-500/30 shrink-0 text-center">
                    <div className="text-[10px] text-amber-400 uppercase font-semibold">Requirement Gap</div>
                    <div className="font-medium text-amber-300 mt-0.5">{flow.gapTech}</div>
                  </div>
                  <span className="text-slate-600">→</span>
                  <div className="p-2 rounded bg-slate-900 border border-teal-500/30 shrink-0 text-center">
                    <div className="text-[10px] text-teal-400 uppercase font-semibold">Target Evidence</div>
                    <div className="font-medium text-teal-300 mt-0.5">{detail.capabilityStrengthened}</div>
                  </div>
                  <span className="text-slate-600">→</span>
                  <div className="p-2 rounded bg-slate-900 border border-emerald-500/30 shrink-0 text-center">
                    <div className="text-[10px] text-emerald-400 uppercase font-semibold">Target Outcome</div>
                    <div className="font-medium text-emerald-300 mt-0.5">{flow.targetOutcome}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Why It Matters */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Zap className="w-3.5 h-3.5" />
                Why this matters for your career
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{detail.whyItMatters}</p>
            </div>

            {/* Execution Steps */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Recommended Implementation Steps
              </h4>
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-300 whitespace-pre-line leading-relaxed font-mono">
                {detail.whatToDo}
              </div>
            </div>

            {/* Reused Project & Capability Impact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detail.reusedProject && (
                <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1">
                    <Layers className="w-3.5 h-3.5 text-teal-400" />
                    Reused Base Project
                  </div>
                  <div className="text-xs font-semibold text-white truncate">{detail.reusedProject}</div>
                </div>
              )}

              <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Capability Strengthened
                </div>
                <div className="text-xs font-semibold text-white">{detail.capabilityStrengthened}</div>
              </div>
            </div>

            {/* Success Criteria */}
            {detail.successCriteria && (
              <div className="border-t border-slate-800/80 pt-3">
                <h4 className="text-xs font-semibold text-slate-300 mb-1">Definition of Done</h4>
                <p className="text-xs text-slate-400">{detail.successCriteria}</p>
              </div>
            )}

            {/* Targeted Opportunities */}
            {detail.targetedOpportunities && detail.targetedOpportunities.length > 0 && (
              <div className="border-t border-slate-800/80 pt-3">
                <h4 className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-teal-400" />
                  Opportunities this move unlocks
                </h4>
                <ul className="space-y-1">
                  {detail.targetedOpportunities.map((opp, idx) => (
                    <li key={idx} className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      {opp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions & Evidence Linking */}
            <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {!actionStarted ? (
                  <button
                    onClick={handleStartAction}
                    className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-lg shadow transition"
                  >
                    Start Action
                  </button>
                ) : (
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Action Started
                  </span>
                )}

                <button
                  onClick={handleAddEvidence}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg shadow transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Add Evidence
                </button>
              </div>

              {/* Feedback toggle */}
              <button
                onClick={() => setShowFeedbackInput(!showFeedbackInput)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Provide Feedback
              </button>
            </div>

            {/* Feedback Input Panel */}
            {showFeedbackInput && !feedbackSuccess && (
              <div className="bg-slate-950 p-3.5 border border-slate-800 rounded-lg space-y-2.5 animate-in fade-in duration-150">
                <p className="text-xs font-semibold text-slate-200">Was this recommendation useful?</p>
                <div className="flex flex-wrap gap-1.5">
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
                      onClick={() => handleFeedbackSubmit(item.type)}
                      disabled={submittingFeedback}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded transition"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {feedbackSuccess && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg text-center font-medium">
                Thank you. Your feedback updates your personal recommendations without altering global intelligence.
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ActionDetailModal;
