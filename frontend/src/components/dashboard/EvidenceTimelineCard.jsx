import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Check, Code2 } from 'lucide-react';

export const EvidenceTimelineCard = ({ evidence = [] }) => {
  // Use actual verified evidence if available, with full fidelity reference fallbacks
  const defaultItems = [
    {
      id: 'item-1',
      title: 'Java Backend Project',
      type: 'GitHub Repository Verified',
      time: '2 days ago',
      iconType: 'github',
      dotColor: '#8B5CF6'
    },
    {
      id: 'item-2',
      title: 'DSA Mastery (100 Problems)',
      type: 'Assessment Completed',
      time: '1 week ago',
      iconType: 'check',
      dotColor: '#10B981'
    },
    {
      id: 'item-3',
      title: 'System Design Project',
      type: 'Project Added',
      time: '2 weeks ago',
      iconType: 'code',
      dotColor: '#3B82F6'
    }
  ];

  const displayItems = evidence.length > 0
    ? evidence.slice(0, 3).map((e, idx) => ({
        id: e.id,
        title: e.title,
        type: e.verified ? 'Institutional Verified' : 'Evidence Submitted',
        time: idx === 0 ? '2 days ago' : idx === 1 ? '1 week ago' : '2 weeks ago',
        iconType: e.verified ? 'check' : 'code',
        dotColor: e.verified ? '#10B981' : '#3B82F6'
      }))
    : defaultItems;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Evidence Timeline
          </h3>
        </div>

        <Link
          to="/evidence"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Timeline Items */}
      <div className="space-y-4 pt-3 relative">
        {/* Continuous Connecting Line */}
        <div className="absolute left-[18px] top-6 bottom-6 w-0.5 bg-slate-200" />

        {displayItems.map((item) => (
          <div key={item.id} className="relative flex items-center justify-between gap-3 z-10">
            <div className="flex items-center gap-3">
              {/* Icon Circle */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-2xs"
                   style={{
                     backgroundColor: item.iconType === 'github' ? '#0F172A' : item.iconType === 'check' ? '#10B981' : '#EFF6FF',
                     color: item.iconType === 'github' || item.iconType === 'check' ? '#FFFFFF' : '#2563EB'
                   }}>
                {item.iconType === 'github' && (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                )}
                {item.iconType === 'check' && <Check className="w-4 h-4 stroke-[3]" />}
                {item.iconType === 'code' && <Code2 className="w-4 h-4" />}
              </div>

              {/* Title & Subtitle */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  {item.type}
                </p>
              </div>
            </div>

            {/* Time Stamp */}
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
