import React from 'react';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

export const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const styles = {
    info: 'bg-slate-900/90 border-slate-800 text-slate-200 shadow-sm',
    error: 'bg-rose-950/40 border-rose-900/60 text-rose-200 shadow-sm',
    warning: 'bg-amber-950/40 border-amber-900/60 text-amber-200 shadow-sm',
    success: 'bg-emerald-950/40 border-emerald-900/60 text-emerald-200 shadow-sm',
  };

  const icons = {
    info: <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
  };

  return (
    <div className={`border rounded-xl p-3.5 flex items-start justify-between gap-3 text-xs sm:text-sm animate-in fade-in-50 duration-150 ${styles[type] || styles.info}`}>
      <div className="flex items-start gap-2.5">
        {icons[type] || icons.info}
        <div className="leading-relaxed font-medium">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors shrink-0 p-0.5 rounded hover:bg-slate-800/60"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

