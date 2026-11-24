import React from 'react';
import { Info, TrendingUp } from 'lucide-react';

export const SkillConfidenceCard = ({ confidenceScore = 87 }) => {
  // SVG circular arc calculations for r=38
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const strokeDashoffset = circumference - (confidenceScore / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between min-h-[170px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
          <span>Your Skill Confidence</span>
          <Info className="w-3.5 h-3.5 text-slate-400" />
        </h3>
      </div>

      {/* Main Content: Circular Ring + Text + Sparkline */}
      <div className="flex items-center justify-between gap-4 my-auto pt-2">
        {/* Circular Progress Ring */}
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
            {/* Background track circle */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke="#E2E8F0"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke="#10B981"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          {/* Centered Percentage */}
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-lg font-black text-slate-900 tracking-tight font-sans">
              {confidenceScore}%
            </span>
          </div>
        </div>

        {/* Text Metric & Rating */}
        <div className="flex-1 space-y-0.5">
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <span>↑ +5%</span>
          </div>
          <h4 className="text-sm font-bold text-emerald-600 leading-tight">
            Excellent!
          </h4>
          <p className="text-[11px] text-slate-500 leading-snug">
            You're in the top 15% of students
          </p>
        </div>

        {/* Smooth Blue Sparkline Line Chart */}
        <div className="w-20 h-12 shrink-0">
          <svg viewBox="0 0 80 40" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="blueSpark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Gradient fill */}
            <path
              d="M0 35 Q 20 28, 35 24 T 60 12 T 80 5 L 80 40 L 0 40 Z"
              fill="url(#blueSpark)"
            />
            {/* Stroke line */}
            <path
              d="M0 35 Q 20 28, 35 24 T 60 12 T 80 5"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* End point dot */}
            <circle cx="80" cy="5" r="3" fill="#2563EB" />
          </svg>
        </div>
      </div>
    </div>
  );
};
