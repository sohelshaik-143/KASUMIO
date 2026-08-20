import React, { useState, useEffect } from 'react';
import { Target, ArrowRight, Zap, CheckCircle2, ChevronDown, ChevronUp, Layers, HelpCircle, AlertCircle } from 'lucide-react';
import actionApi from '../../api/actionApi';
import { ActionDetailModal } from './ActionDetailModal';

export const NextMoveCard = ({ onActionUpdated }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const handleActionCompletedOrUpdated = () => {
    fetchNextMove();
    if (onActionUpdated) onActionUpdated();
  };

  if (loading) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-lg bg-teal-500/20" />
          <div className="h-4 w-32 bg-slate-800 rounded" />
        </div>
        <div className="h-6 w-3/4 bg-slate-800 rounded mb-3" />
        <div className="h-4 w-1/2 bg-slate-800 rounded mb-4" />
      </div>
    );
  }

  if (error || !data || !data.primaryNextMove) {
    return null;
  }

  const primary = data.primaryNextMove;
  const alternatives = data.alternativeMoves || [];

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-925 border border-teal-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Glowing background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-400">
              <Target className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Your Next Move
            </span>
            {data.careerGoalTitle && (
              <span className="text-[11px] font-medium text-slate-400 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60 hidden sm:inline-block">
                Goal: {data.careerGoalTitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
              primary.evidenceRoi === 'HIGH'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              ROI: {primary.evidenceRoi || 'HIGH'}
            </span>
            <span className="text-[10px] font-medium text-slate-400 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60">
              Effort: {primary.estimatedEffort || 'Moderate'}
            </span>
          </div>
        </div>

        {/* Action Title & Description */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white tracking-tight mb-1.5 flex items-center gap-2">
            {primary.title}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {primary.description}
          </p>
        </div>

        {/* Why Reasoning & Reused Context */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 mb-5 space-y-2">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">
              <strong className="text-white font-semibold">Why this move? </strong>
              {primary.reasoning}
            </p>
          </div>

          {primary.reusedProjectName && (
            <div className="flex items-center gap-2 text-xs text-teal-300/90 pt-1 border-t border-slate-800/60">
              <Layers className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>
                <strong className="text-white font-medium">Project Leverage: </strong>
                Builds directly on your existing <span className="underline decoration-teal-500/40">{primary.reusedProjectName}</span>
              </span>
            </div>
          )}
        </div>

        {/* Action Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenDetails(primary.id)}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              Start This Move
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleOpenDetails(primary.id)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition"
            >
              View Guidance
            </button>
          </div>

          {alternatives.length > 0 && (
            <button
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium transition"
            >
              {showAlternatives ? 'Hide' : `See ${alternatives.length} Alternative Moves`}
              {showAlternatives ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Alternative Moves Section */}
        {showAlternatives && alternatives.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-200">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Alternative Growth Options
            </p>
            {alternatives.map((alt) => (
              <div
                key={alt.id}
                className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div>
                  <h4 className="text-xs font-semibold text-white mb-0.5">{alt.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{alt.description}</p>
                </div>
                <button
                  onClick={() => handleOpenDetails(alt.id)}
                  className="px-3 py-1.5 text-[11px] font-medium text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg shrink-0 transition"
                >
                  Inspect Move
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Details & Completion Modal */}
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
