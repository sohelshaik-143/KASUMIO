import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ClipboardCheck, Code2, BarChart2, Briefcase } from 'lucide-react';

export const QuickActionsCard = ({ onAddProject }) => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Take Assessment',
      icon: ClipboardCheck,
      color: '#2563EB',
      bg: 'bg-blue-50/70 border-blue-200/70 hover:bg-blue-100/70',
      textColor: 'text-blue-700',
      onClick: () => navigate('/student/assessments'),
    },
    {
      label: 'Add Project',
      icon: Code2,
      color: '#7C3AED',
      bg: 'bg-purple-50/70 border-purple-200/70 hover:bg-purple-100/70',
      textColor: 'text-purple-700',
      onClick: onAddProject ? onAddProject : () => navigate('/evidence'),
    },
    {
      label: 'Update Skills',
      icon: BarChart2,
      color: '#059669',
      bg: 'bg-emerald-50/70 border-emerald-200/70 hover:bg-emerald-100/70',
      textColor: 'text-emerald-700',
      onClick: () => navigate('/student/intelligence'),
    },
    {
      label: 'Explore Jobs',
      icon: Briefcase,
      color: '#0284C7',
      bg: 'bg-sky-50/70 border-sky-200/70 hover:bg-sky-100/70',
      textColor: 'text-sky-700',
      onClick: () => navigate('/student/discover'),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <Zap className="w-4 h-4 fill-blue-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Quick Actions
        </h3>
      </div>

      {/* 4 Action Tiles Grid */}
      <div className="grid grid-cols-4 gap-2.5 pt-3 my-auto">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.label}
              type="button"
              onClick={act.onClick}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-150 group cursor-pointer ${act.bg}`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition group-hover:scale-105">
                <Icon className="w-5 h-5" style={{ color: act.color }} />
              </div>
              <span className={`text-[11px] font-bold text-center leading-tight ${act.textColor}`}>
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
