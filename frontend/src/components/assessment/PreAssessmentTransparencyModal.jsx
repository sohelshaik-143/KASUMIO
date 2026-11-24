import React, { useState } from 'react';
import {
  ShieldCheck,
  EyeOff,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Modal } from '../common/Modal';

/**
 * PreAssessmentTransparencyModal
 * Provides candidate transparency disclosure and captures self-assessment level.
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
    <Modal
      isOpen={isOpen}
      onClose={!starting ? onClose : () => {}}
      title="Pre-Assessment Self-Assessment & Disclosure"
      description={`Role: ${opportunityTitle || 'Technical Role'} • ${assessmentTitle}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Step 1: Self-Assessment */}
        <div className="space-y-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-700" aria-hidden="true" />
              <span>Step 1: What is your current technical proficiency level?</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              KASUMIO compares your self-assessment with actual demonstrated evidence constructively—never as an insult.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1" role="radiogroup" aria-label="Proficiency Level">
            {/* LOW */}
            <button
              type="button"
              role="radio"
              aria-checked={selfLevel === 'LOW'}
              onClick={() => setSelfLevel('LOW')}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between space-y-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 ${
                selfLevel === 'LOW'
                  ? 'bg-teal-50 border-teal-600 ring-1 ring-teal-600'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">LOW</span>
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Foundational
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Comfortable with basic syntax, simple loops, conditionals, and standard types.
              </p>
            </button>

            {/* MEDIUM */}
            <button
              type="button"
              role="radio"
              aria-checked={selfLevel === 'MEDIUM'}
              onClick={() => setSelfLevel('MEDIUM')}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between space-y-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 ${
                selfLevel === 'MEDIUM'
                  ? 'bg-teal-50 border-teal-600 ring-1 ring-teal-600'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">MEDIUM</span>
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                  Proficient
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Solid grasp of data structures, standard algorithms, edge cases, and clean code.
              </p>
            </button>

            {/* EXCELLENT */}
            <button
              type="button"
              role="radio"
              aria-checked={selfLevel === 'EXCELLENT'}
              onClick={() => setSelfLevel('EXCELLENT')}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between space-y-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 ${
                selfLevel === 'EXCELLENT'
                  ? 'bg-teal-50 border-teal-600 ring-1 ring-teal-600'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">EXCELLENT</span>
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Advanced
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mastery of optimization, algorithmic complexity, concurrency, and architecture.
              </p>
            </button>
          </div>
        </div>

        {/* Step 2: Transparency Notice */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-teal-700" aria-hidden="true" />
            <span>Step 2: Candidate Transparency & Integrity Notice</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs leading-relaxed text-slate-700">
            <p className="font-medium text-slate-900">
              "This assessment uses automated systems to evaluate your submitted solutions and may monitor assessment activity for integrity purposes. These signals are used to support assessment review and are not treated as automatic proof of misconduct."
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div className="flex items-start gap-2 bg-teal-50/80 p-3 rounded-lg border border-teal-200 text-teal-950">
                <ShieldCheck className="w-4 h-4 text-teal-700 mt-0.5 shrink-0" aria-hidden="true" />
                <div className="space-y-0.5 text-xs">
                  <strong>What We Verify:</strong>
                  <p>Code correctness, algorithmic approaches, time/space complexity, and concept demonstrations.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-slate-200 text-slate-700">
                <EyeOff className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" aria-hidden="true" />
                <div className="space-y-0.5 text-xs">
                  <strong>Zero Surveillance Guarantee:</strong>
                  <p>No webcam recording, eye tracking, facial emotion analysis, accent evaluation, or invasive proctoring.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Checkbox Acknowledgment */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="transparency-acknowledged"
              checked={acknowledged}
              onChange={(e) => {
                setAcknowledged(e.target.checked);
                if (e.target.checked) setErrorMsg(null);
              }}
              className="mt-0.5 w-4 h-4 rounded text-teal-700 border-slate-300 focus:ring-teal-600"
            />
            <span className="text-xs text-slate-700">
              I understand how my technical evidence and code will be verified, and I confirm my self-assessment level of <strong>{selfLevel}</strong>.
            </span>
          </label>

          {errorMsg && (
            <p role="alert" className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            type="button"
            disabled={starting}
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-lg transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={starting}
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg shadow-xs transition disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            {starting ? (
              <span>Initializing Sandbox...</span>
            ) : (
              <>
                <span>Begin Technical Assessment</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PreAssessmentTransparencyModal;
