import React, { useState } from 'react';
import {
  ShieldCheck,
  EyeOff,
  Cpu,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Layers,
  X,
  Lock,
  ArrowRight
} from 'lucide-react';

/**
 * PreAssessmentTransparencyModal
 * Provides candidate transparency disclosure (Principle #13, #14)
 * and captures self-assessment level (Principle #5).
 */
export const PreAssessmentTransparencyModal = ({
  isOpen,
  onClose,
  onConfirmStart,
  assessmentTitle,
  opportunityTitle,
  starting = false
}) => {
  const [selfLevel, setSelfLevel] = useState('MEDIUM');
  const [acknowledged, setAcknowledged] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleStart = () => {
    if (!acknowledged) {
      setErrorMsg('Please acknowledge the fair assessment verification terms to continue.');
      return;
    }
    setErrorMsg(null);
    onConfirmStart({
      selfAssessmentLevel: selfLevel,
      acknowledgedTransparency: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={!starting ? onClose : undefined}
      />

      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 z-10 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>KASUMO Fair Technical Verification</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Pre-Assessment Self-Assessment & Disclosure
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Role: <strong>{opportunityTitle || 'Technical Role'}</strong> • {assessmentTitle}
            </p>
          </div>
          {!starting && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Section 1: Self-Assessment */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Step 1: What is your current technical proficiency level?</span>
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              KASUMO compares your self-assessment with actual demonstrated evidence constructively—never as an insult.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* LOW */}
            <div
              onClick={() => setSelfLevel('LOW')}
              className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${selfLevel === 'LOW'
                  ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">LOW</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  Foundational
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Comfortable with basic syntax, simple loops, conditionals, and standard types.
              </p>
            </div>

            {/* MEDIUM */}
            <div
              onClick={() => setSelfLevel('MEDIUM')}
              className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${selfLevel === 'MEDIUM'
                  ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">MEDIUM</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  Proficient
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Solid grasp of data structures, standard algorithms, edge cases, and clean code.
              </p>
            </div>

            {/* EXCELLENT */}
            <div
              onClick={() => setSelfLevel('EXCELLENT')}
              className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${selfLevel === 'EXCELLENT'
                  ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">EXCELLENT</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                  Advanced
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mastery of optimization, algorithmic complexity, concurrency, and architecture.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Transparency Disclosure & Anti-Surveillance Guarantee */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Step 2: Candidate Transparency & Integrity Notice</span>
          </label>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3 text-xs leading-relaxed text-slate-700">
            <p className="font-medium text-slate-900">
              "This assessment uses automated systems to evaluate your submitted solutions and may monitor assessment activity for integrity purposes. These signals are used to support assessment review and are not treated as automatic proof of misconduct."
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
              <div className="flex items-start gap-2 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="space-y-0.5 text-[11px]">
                  <strong>What We Verify:</strong>
                  <p>Code correctness, algorithmic approaches, time/space complexity, and concept demonstrations.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-slate-100 p-3 rounded-xl border border-slate-200 text-slate-700">
                <EyeOff className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div className="space-y-0.5 text-[11px]">
                  <strong>Zero Surveillance Guarantee:</strong>
                  <p>No webcam recording, eye tracking, facial emotion analysis, accent evaluation, or invasive proctoring.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Checkbox Acknowledgment */}
        <div className="space-y-2 pt-1">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => {
                setAcknowledged(e.target.checked);
                if (e.target.checked) setErrorMsg(null);
              }}
              className="mt-0.5 w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
            />
            <span className="text-xs text-slate-700">
              I understand how my technical evidence and code will be verified, and I confirm my self-assessment level of <strong>{selfLevel}</strong>.
            </span>
          </label>

          {errorMsg && (
            <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            disabled={starting}
            onClick={onClose}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={starting}
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
          >
            {starting ? (
              <span>Initializing Sandbox...</span>
            ) : (
              <>
                <span>Begin Technical Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
