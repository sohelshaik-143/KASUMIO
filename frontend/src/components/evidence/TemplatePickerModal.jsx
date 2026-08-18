import React from 'react';
import { X, FileCode2, Globe, Award, BookOpen, Trophy, ArrowRight, Sparkles } from 'lucide-react';

export const TemplatePickerModal = ({ isOpen, onClose, templates, onSelectTemplate }) => {
  if (!isOpen) return null;

  const iconMap = {
    PROJECT: <FileCode2 className="w-5 h-5 text-teal-400" />,
    CERTIFICATE: <Award className="w-5 h-5 text-amber-400" />,
    PUBLICATION: <BookOpen className="w-5 h-5 text-indigo-400" />,
    OTHER: <Trophy className="w-5 h-5 text-emerald-400" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in-50 duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Choose Evidence Template</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Structured frameworks to ensure your proof meets institutional verification standards.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3">
          {templates.map((tpl) => {
            let fields = {};
            try {
              fields = typeof tpl.suggestedFields === 'string' 
                ? JSON.parse(tpl.suggestedFields) 
                : tpl.suggestedFields || {};
            } catch (e) {
              fields = {};
            }

            return (
              <div
                key={tpl.id}
                className="border border-slate-800/90 bg-slate-925/80 hover:border-teal-500/40 hover:bg-slate-850/90 rounded-xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-800 shrink-0 mt-0.5 shadow-sm">
                    {iconMap[tpl.evidenceType] || <FileCode2 className="w-5 h-5 text-teal-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors tracking-tight">
                        {tpl.title}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                        {tpl.evidenceType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {tpl.description}
                    </p>
                    {fields.guidance && (
                      <p className="text-[11px] text-teal-300 mt-2 bg-teal-950/40 px-2.5 py-1 rounded-lg border border-teal-900/40 font-medium">
                        💡 {fields.guidance}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onSelectTemplate(tpl)}
                  className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition-all shadow-sm active:scale-98"
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
