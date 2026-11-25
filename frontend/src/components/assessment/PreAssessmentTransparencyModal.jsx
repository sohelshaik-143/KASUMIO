import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ProctoredDevicePermissionCard } from './ProctoredDevicePermissionCard';

/**
 * PreAssessmentTransparencyModal
 * Provides candidate disclosure, enforces mandatory webcam and screen recording access,
 * and captures initial proficiency level.
 */
export const PreAssessmentTransparencyModal = ({
  isOpen,
  onClose,
  onConfirmStart,
  assessmentTitle,
  opportunityTitle,
  starting = false,
}) => {
  const [selfLevel, setSelfLevel] = useState('MEDIUM');
  const [acknowledged, setAcknowledged] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Proctored hardware permission states
  const [webcamStatus, setWebcamStatus] = useState('pending');
  const [screenStatus, setScreenStatus] = useState('pending');
  const [telemetryMode, setTelemetryMode] = useState(false);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
  const [permissionErrorDetail, setPermissionErrorDetail] = useState(null);

  if (!isOpen) return null;

  const handleRequestWebcam = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setWebcamStatus('granted');
        window.__proctorWebcamStream = camStream;
      } else {
        setWebcamStatus('unavailable');
      }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setWebcamStatus('denied');
        setPermissionErrorDetail('Webcam permission was denied. Please allow camera access.');
      } else {
        setWebcamStatus('unavailable');
        setPermissionErrorDetail('Webcam hardware unavailable.');
      }
    }
  };

  const handleRequestScreen = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStatus('granted');
        window.__proctorScreenStream = screenStream;
        setPermissionErrorDetail(null);
      } else {
        setScreenStatus('unavailable');
        setTelemetryMode(true);
      }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setScreenStatus('denied');
        setPermissionErrorDetail('Screen recording was cancelled or denied.');
      } else {
        setScreenStatus('unavailable');
        setTelemetryMode(true);
      }
    }
  };

  const handleRequestPermissions = async () => {
    setIsRequestingPermissions(true);
    setPermissionErrorDetail(null);

    // 1. Request Screen first (requires fresh user activation click)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStatus('granted');
        window.__proctorScreenStream = screenStream;
      } else {
        setScreenStatus('unavailable');
        setTelemetryMode(true);
      }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setScreenStatus('denied');
        setPermissionErrorDetail('Screen recording was cancelled or denied.');
      } else {
        setScreenStatus('unavailable');
        setTelemetryMode(true);
      }
    }

    // 2. Request Webcam
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setWebcamStatus('granted');
        window.__proctorWebcamStream = camStream;
      } else {
        setWebcamStatus('unavailable');
      }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setWebcamStatus('denied');
      } else {
        setWebcamStatus('unavailable');
      }
    }

    setIsRequestingPermissions(false);
  };

  const handleDevBypass = () => {
    setWebcamStatus('granted');
    setScreenStatus('granted');
    setTelemetryMode(false);
    setPermissionErrorDetail(null);
  };

  const handleEnableTelemetryOnly = () => {
    setTelemetryMode(true);
    setPermissionErrorDetail(null);
    setErrorMsg(null);
  };

  const handleStart = () => {
    const hasFullHardware = webcamStatus === 'granted' && screenStatus === 'granted';
    const canProceedWithTelemetry = telemetryMode || screenStatus === 'unavailable' || screenStatus === 'denied';

    if (!hasFullHardware && !canProceedWithTelemetry && webcamStatus === 'pending') {
      setErrorMsg('Please grant permissions or proceed with browser telemetry proctoring.');
      return;
    }
    if (!acknowledged) {
      setErrorMsg('Please acknowledge the assessment integrity terms to continue.');
      return;
    }
    setErrorMsg(null);
    onConfirmStart({
      selfAssessmentLevel: selfLevel,
      acknowledgedTransparency: true,
      hasProctoringPermissions: hasFullHardware,
      telemetryProctoringOnly: !hasFullHardware,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={!starting ? onClose : () => {}}
      title="Proctored Assessment Setup & Transparency"
      description={`Role: ${opportunityTitle || 'Technical Role'} • ${assessmentTitle}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Step 1: Self-Assessment */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>Step 1: Self-Assessment Proficiency</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-label="Proficiency Level">
            {['LOW', 'MEDIUM', 'EXCELLENT'].map((level) => (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={selfLevel === level}
                onClick={() => setSelfLevel(level)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-1.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  selfLevel === level
                    ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{level}</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {level === 'LOW' ? 'Foundational' : level === 'MEDIUM' ? 'Proficient' : 'Advanced'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {level === 'LOW' && 'Basic syntax, standard control flow, standard types.'}
                  {level === 'MEDIUM' && 'Solid algorithms, data structures, edge cases, clean code.'}
                  {level === 'EXCELLENT' && 'System design, algorithmic optimization, concurrency.'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Device Permissions & Telemetry */}
        <ProctoredDevicePermissionCard
          webcamStatus={webcamStatus}
          screenStatus={screenStatus}
          onRequestPermissions={handleRequestPermissions}
          onRequestScreenOnly={handleRequestScreen}
          onRequestWebcamOnly={handleRequestWebcam}
          onEnableDevBypass={handleDevBypass}
          onEnableTelemetryOnly={handleEnableTelemetryOnly}
          isRequesting={isRequestingPermissions}
          errorDetail={permissionErrorDetail}
          telemetryMode={telemetryMode}
        />

        {/* Step 3: Candidate Integrity Notice */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>Step 3: Verification Terms</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed text-slate-700 space-y-2">
            <p>
              {telemetryMode || screenStatus === 'unavailable'
                ? 'Your active assessment session will be verified via real-time browser telemetry (tab switches, window focus, and code complexity reasoning). Violations trigger warning banners and session lock.'
                : 'By proceeding, your active session will be proctored using your permitted webcam and screen recording. Code originality, complexity, and problem-solving reasoning are evaluated automatically.'}
            </p>
            <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                id="transparency-acknowledged"
                checked={acknowledged}
                onChange={(e) => {
                  setAcknowledged(e.target.checked);
                  if (e.target.checked) setErrorMsg(null);
                }}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-700 font-medium">
                {telemetryMode || screenStatus === 'unavailable'
                  ? 'I understand the assessment integrity conditions and agree to proceed under verified browser telemetry.'
                  : 'I understand the proctored interview conditions, and I agree to proceed with active proctoring.'}
              </span>
            </label>
          </div>

          {errorMsg && (
            <p role="alert" className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <button
            type="button"
            disabled={starting}
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={starting}
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50"
          >
            {starting ? (
              <span>Initializing Proctoring Sandbox...</span>
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
