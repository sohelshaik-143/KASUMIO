import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data in this section.',
  actionText,
  onAction,
}) => {
  return (
    <div className="border border-dashed border-slate-200 bg-white/70 rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-lg mx-auto my-6 shadow-xs animate-in fade-in-50 duration-200">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-98"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
