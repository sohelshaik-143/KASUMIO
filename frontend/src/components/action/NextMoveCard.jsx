import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, Layers, Sparkles, ChevronDown, ChevronUp, AlertCircle, PlusCircle, ArrowUpRight, CheckCircle2, RotateCcw } from 'lucide-react';
import actionApi from '../../api/actionApi';
import { ActionDetailModal } from './ActionDetailModal';

export const NextMoveCard = ({ onActionUpdated }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const fetchNextMove = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await actionApi.getNextAction();
      setData(res);
    } catch (err) {
      console.error('Failed to load next action', err);
      setError('Unable to load career recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextMove();
  }, []);

  const handleOpenDetails = (actionId) => {
    setSelectedActionId(actionId);
    setModalOpen(true);
  };

  const handleSkip = async (e, actionId) => {
    e.stopPropagation();
    try {
      setSkipping(true);
      await actionApi.skipAction(actionId);
      await fetchNextMove();
      if (onActionUpdated) onActionUpdated();
    } catch (err) {
      console.error('Failed to skip action', err);
    } finally {
      setSkipping(false);
    }
  };

  const handleActionCompletedOrUpdated = () => {
    fetchNextMove();
    if (onActionUpdated) onActionUpdated();
  };

  if (loading) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 animate-pulse space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 bg-slate-800 rounded" />
          <div className="h-4 w-16 bg-slate-800 rounded" />
        </div>
        <div className="h-5 w-2/3 bg-slate-800 rounded" />
        <div className="h-3.5 w-full bg-slate-800/60 rounded" />
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  // Confidence Gate: Insufficient evidence scenario
  if (data.insufficientEvidence) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>Confidence Gate</span>
        </div>
        <p className="text-sm font-medium text-slate-200">
          I don't have enough evidence to confidently recommend your next step yet.
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Upload verified projects, repository links, or certifications to enable personalized, goal-aligned recommendations.
        </p>
        <button
          onClick={() => navigate('/evidence')}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Add Evidence
        </button>
      </div>
    );
  }

  const primary = data.primaryNextMove;
  if (!primary) return null;
  const alternatives = data.alternativeMoves || [];
  const flow = data.visualFlow;

  return (
    <>
      <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700/80 transition shadow-sm">
        {/* Top Header: Badge, Goal, ROI */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-teal-500/10 text-teal-400">
              <Target className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-400">
              Your Next Move
            </span>
            {data.careerGoalTitle && (
              <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 hidden sm:inline-block">
                Goal: {data.careerGoalTitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
              primary.evidenceRoi === 'HIGH'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              Evidence ROI: {primary.evidenceRoi || 'HIGH'}
            </span>
            <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60">
              Effort: {primary.estimatedEffort || 'Moderate'}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            {primary.title}
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {primary.description}
          </p>
        </div>

        {/* Why this move & Project Reuse */}
        <div className="bg-slate-950/70 border border-slate-800/70 rounded-lg p-3 space-y-2">
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-slate-200">Why this move? </span>
            {primary.reasoning}
          </div>

          {primary.reusedProjectName && (
            <div className="flex items-center gap-1.5 text-xs text-teal-300/90 pt-1.5 border-t border-slate-800/60">
              <Layers className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>
                <span className="font-medium text-slate-300">Project Leverage: </span>
                Builds directly on your existing <span className="text-teal-300 font-medium">{primary.reusedProjectName}</span>
              </span>
            </div>
          )}
        </div>

        {/* Minimal Graphical Flow Representation */}
        {flow && (
          <div className="bg-slate-950/40 border border-slate-800/50 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 overflow-x-auto gap-2 py-0.5">
              <div className="shrink-0 font-medium text-slate-300">{flow.currentTech || 'Current Proof'}</div>
              <span className="text-slate-600">→</span>
              <div className="shrink-0 text-amber-400/90 font-medium">{flow.gapTech} Gap</div>
              <span className="text-slate-600">→</span>
              <div className="shrink-0 text-teal-400 font-medium">{flow.actionTitle ? 'Action' : 'Improve'}</div>
              <span className="text-slate-600">→</span>
              <div className="shrink-0 text-emerald-400 font-medium">New Evidence</div>
              <span className="text-slate-600">→</span>
              <div className="shrink-0 text-slate-300 font-medium">{flow.targetOutcome || 'Goal Readiness'}</div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenDetails(primary.id)}
              className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              Start This Move
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleOpenDetails(primary.id)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg border border-slate-700 transition"
            >
              View Guidance
            </button>

            <button
              onClick={(e) => handleSkip(e, primary.id)}
              disabled={skipping}
              className="px-2.5 py-1.5 text-slate-400 hover:text-slate-200 text-xs font-medium transition"
              title="Skip this recommendation for now"
            >
              Skip
            </button>
          </div>

          {alternatives.length > 0 && (
            <button
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium transition"
            >
              {showAlternatives ? 'Hide' : `${alternatives.length} Alternative Moves`}
              {showAlternatives ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Alternative Moves */}
        {showAlternatives && alternatives.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Alternative Options
            </p>
            {alternatives.map((alt) => (
              <div
                key={alt.id}
                className="p-2.5 bg-slate-950/40 border border-slate-800/60 rounded-lg flex items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-medium text-white truncate">{alt.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{alt.description}</p>
                </div>
                <button
                  onClick={() => handleOpenDetails(alt.id)}
                  className="px-2.5 py-1 text-[11px] font-medium text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 rounded shrink-0 transition"
                >
                  Inspect
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {modalOpen && (
        <ActionDetailModal
          actionId={selectedActionId}
          onClose={() => setModalOpen(false)}
          onActionUpdated={handleActionCompletedOrUpdated}
        />
      )}
    </>
  );
};

export default NextMoveCard;
