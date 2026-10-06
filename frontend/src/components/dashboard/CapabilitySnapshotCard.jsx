import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';

/**
 * Capability Snapshot displaying Strong, Developing, and Learning competency columns.
 */
export const CapabilitySnapshotCard = ({
  strongCapabilities = [],
  developingCapabilities = [],
  learningCapabilities = [],
  onCapabilityClick,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Capability Snapshot
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evidence-backed states replacing arbitrary AI scores. Click any capability to inspect supporting proof items.
          </p>
        </div>

        <Link
          to="/student/intelligence"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          <span>Full Capability Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Capability States Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strong Capabilities (Verified Proof) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Strong ({strongCapabilities.length})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Verified Proof</span>
          </div>

          {strongCapabilities.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              No verified capabilities yet. Request verification on uploaded evidence.
            </p>
          ) : (
            <div className="space-y-2">
              {strongCapabilities.map((sk) => (
                <button
                  key={sk.id}
                  onClick={() => onCapabilityClick?.(sk, 'Strong')}
                  className="w-full p-2.5 rounded-lg bg-white border border-emerald-200 hover:border-emerald-400 transition text-left flex items-center justify-between text-xs shadow-xs group"
                >
                  <div>
                    <span className="font-bold text-slate-900 group-hover:text-indigo-600">{sk.name}</span>
                    <span className="text-[10px] text-slate-400 block">{sk.category}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Verified
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Developing Capabilities (Submitted Evidence) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Developing ({developingCapabilities.length})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Submitted Proof</span>
          </div>

          {developingCapabilities.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              No developing capabilities. Submit code repos or certificates to build proof.
            </p>
          ) : (
            <div className="space-y-2">
              {developingCapabilities.map((sk) => (
                <button
                  key={sk.id}
                  onClick={() => onCapabilityClick?.(sk, 'Developing')}
                  className="w-full p-2.5 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 transition text-left flex items-center justify-between text-xs shadow-xs group"
                >
                  <div>
                    <span className="font-bold text-slate-900 group-hover:text-indigo-600">{sk.name}</span>
                    <span className="text-[10px] text-slate-400 block">{sk.category}</span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Developing
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Learning / Target Capabilities */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Learning ({learningCapabilities.length})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Growth Target</span>
          </div>

          <div className="space-y-2">
            {learningCapabilities.map((sk) => (
              <button
                key={sk.id}
                onClick={() => onCapabilityClick?.(sk, 'Learning')}
                className="w-full p-2.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 transition text-left flex items-center justify-between text-xs shadow-xs group"
              >
                <div>
                  <span className="font-semibold text-slate-800 group-hover:text-indigo-600">{sk.name}</span>
                  <span className="text-[10px] text-slate-400 block">{sk.category}</span>
                </div>
                <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Learning
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
