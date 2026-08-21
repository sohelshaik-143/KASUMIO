import React from 'react';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

export const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const styles = {
    info: 'bg-indigo-50 border-indigo-200 text-indigo-900 shadow-xs',
    error: 'bg-rose-50 border-rose-200 text-rose-900 shadow-xs',
    warning: 'bg-amber-50 border-amber-200 text-amber-900 shadow-xs',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-xs',
  };

  const icons = {
    info: <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
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
          className="text-slate-400 hover:text-slate-700 transition-colors shrink-0 p-0.5 rounded hover:bg-slate-100"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
