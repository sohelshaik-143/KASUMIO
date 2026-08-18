import React from 'react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3.5 animate-in fade-in-50 duration-200">
      <div
        className={`${sizeClasses[size]} border-slate-800 border-t-teal-400 rounded-full animate-spin shadow-glow-teal`}
      />
      {text && <p className="text-xs font-medium text-slate-400 tracking-wide">{text}</p>}
    </div>
  );
};
