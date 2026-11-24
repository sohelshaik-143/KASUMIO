import React, { useState } from 'react';
import { Camera, Monitor, CheckCircle2, AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';

/**
 * ProctoredDevicePermissionCard
 * Handles webcam and screen-recording permission requests, denials, and unavailable devices.
 */
export const ProctoredDevicePermissionCard = ({
  webcamStatus, // 'pending' | 'granted' | 'denied' | 'unavailable'
  screenStatus, // 'pending' | 'granted' | 'denied' | 'unavailable'
  onRequestPermissions,
  onEnableDevBypass,
  isRequesting,
  errorDetail,
}) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            <span>Interview Proctoring Permissions (Mandatory)</span>
          </h4>
          <p className="text-[11px] text-slate-500">
            Both webcam and full screen-recording permissions are required before beginning.
          </p>
        </div>
      </div>

      {/* Permission Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Webcam Item */}
        <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
          webcamStatus === 'granted'
            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
            : webcamStatus === 'denied'
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : webcamStatus === 'unavailable'
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2">
            <Camera className={`w-4 h-4 ${
              webcamStatus === 'granted' ? 'text-emerald-600' : webcamStatus === 'denied' ? 'text-rose-600' : 'text-slate-500'
            }`} />
            <div>
              <span className="font-bold block">Webcam Feed</span>
              <span className="text-[10px] text-slate-500">
                {webcamStatus === 'granted' && 'Camera verified & active'}
                {webcamStatus === 'pending' && 'Permission required'}
                {webcamStatus === 'denied' && 'Access blocked by browser'}
                {webcamStatus === 'unavailable' && 'No camera detected'}
              </span>
            </div>
          </div>
          {webcamStatus === 'granted' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
              {webcamStatus}
            </span>
          )}
        </div>

        {/* Screen Share Item */}
        <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
          screenStatus === 'granted'
            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
            : screenStatus === 'denied'
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : screenStatus === 'unavailable'
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-white border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2">
            <Monitor className={`w-4 h-4 ${
              screenStatus === 'granted' ? 'text-emerald-600' : screenStatus === 'denied' ? 'text-rose-600' : 'text-slate-500'
            }`} />
            <div>
              <span className="font-bold block">Screen Recording</span>
              <span className="text-[10px] text-slate-500">
                {screenStatus === 'granted' && 'Display capture active'}
                {screenStatus === 'pending' && 'Permission required'}
                {screenStatus === 'denied' && 'Screen share cancelled'}
                {screenStatus === 'unavailable' && 'Display media unavailable'}
              </span>
            </div>
          </div>
          {screenStatus === 'granted' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
              {screenStatus}
            </span>
          )}
        </div>
      </div>

      {/* Error or Denial Guidance */}
      {errorDetail && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Device Permission Required</p>
            <p>{errorDetail}</p>
            <p className="text-[10px] text-rose-700">
              Please click the lock/camera icon in your browser URL bar, grant permissions, and click "Retry Device Permissions".
            </p>
          </div>
        </div>
      )}

      {/* Permission Action Button */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onRequestPermissions}
          disabled={isRequesting || (webcamStatus === 'granted' && screenStatus === 'granted')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRequesting ? 'animate-spin' : ''}`} />
          <span>
            {webcamStatus === 'granted' && screenStatus === 'granted'
              ? 'Permissions Granted ✓'
              : isRequesting
              ? 'Requesting System Permissions...'
              : 'Grant Camera & Screen Permissions'}
          </span>
        </button>

        {/* Fallback Simulator for headless / sandbox without hardware */}
        {onEnableDevBypass && (
          <button
            type="button"
            onClick={onEnableDevBypass}
            className="text-[11px] text-slate-600 hover:text-indigo-600 underline font-medium transition"
          >
            Use Simulated Test Devices (Dev Mode)
          </button>
        )}
      </div>
    </div>
  );
};

export default ProctoredDevicePermissionCard;
