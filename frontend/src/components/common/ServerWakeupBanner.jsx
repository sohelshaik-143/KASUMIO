import React, { useState, useEffect } from 'react';
import { onServerWakeupChange } from '../../api/client';
import { Loader2, CheckCircle2, Server, X } from 'lucide-react';

/**
 * ServerWakeupBanner displays a non-intrusive floating status banner
 * when the backend (e.g. on Render free tier) is cold-starting.
 * Automatically notifies user, shows attempt count/timer, and dismisses on wake-up.
 */
export const ServerWakeupBanner = () => {
  const [status, setStatus] = useState({ isWaking: false, attempt: 1, maxRetries: 3 });
  const [showResolved, setShowResolved] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = onServerWakeupChange((event) => {
      if (event.isWaking) {
        setDismissed(false);
        setShowResolved(false);
        setStatus(event);
      } else if (event.resolved) {
        setStatus({ isWaking: false });
        setShowResolved(true);
        const timer = setTimeout(() => {
          setShowResolved(false);
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        setStatus({ isWaking: false });
      }
    });

    return () => unsubscribe();
  }, []);

  // Timer while server is waking up
  useEffect(() => {
    let interval = null;
    if (status.isWaking) {
      setSecondsElapsed(0);
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      setSecondsElapsed(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status.isWaking]);

  if (dismissed || (!status.isWaking && !showResolved)) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg transition-all duration-300"
    >
      {status.isWaking ? (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-900/95 backdrop-blur-md text-white border border-amber-500/40 rounded-2xl shadow-xl shadow-black/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-100">
                  Connecting to server...
                </span>
                <span className="px-1.5 py-0.5 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/30">
                  Please wait
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                Establishing connection. Retrying automatically...
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : showResolved ? (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-emerald-900/95 backdrop-blur-md text-white border border-emerald-500/40 rounded-2xl shadow-xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-100">
                Backend Server Online
              </p>
              <p className="text-xs text-emerald-300/80">
                Connection established successfully.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowResolved(false)}
            className="flex-shrink-0 p-1 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-800 transition"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ServerWakeupBanner;
