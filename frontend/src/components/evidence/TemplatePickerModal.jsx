import React from 'react';
import { FileCode2, Award, BookOpen, Trophy, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';

export const TemplatePickerModal = ({ isOpen, onClose, templates = [], onSelectTemplate }) => {
  if (!isOpen) return null;

  const iconMap = {
    PROJECT: <FileCode2 className="w-5 h-5 text-teal-700" aria-hidden="true" />,
    CERTIFICATE: <Award className="w-5 h-5 text-amber-700" aria-hidden="true" />,
    PUBLICATION: <BookOpen className="w-5 h-5 text-slate-700" aria-hidden="true" />,
    OTHER: <Trophy className="w-5 h-5 text-teal-700" aria-hidden="true" />,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Evidence Template"
      description="Structured frameworks to ensure your proof meets institutional verification standards."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
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
              className="border border-slate-200 bg-white hover:border-teal-300 rounded-xl p-4 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0 mt-0.5">
                  {iconMap[tpl.evidenceType] || <FileCode2 className="w-5 h-5 text-teal-700" aria-hidden="true" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      {tpl.title}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                      {tpl.evidenceType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {tpl.description}
                  </p>
                  {fields.guidance && (
                    <p className="text-xs text-teal-900 mt-2 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 font-medium">
                      💡 {fields.guidance}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectTemplate(tpl)}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
              >
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 bg-white border border-slate-300 rounded-lg transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default TemplatePickerModal;
