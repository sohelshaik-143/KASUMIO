import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Check, Code2, PlusCircle, Image as ImageIcon } from 'lucide-react';

export const EvidenceTimelineCard = ({ evidence = [], onAddEvidence }) => {
  const hasEvidence = evidence.length > 0;

  // Format relative timestamp from created date
  const getRelativeTime = (dateStr, idx) => {
    if (!dateStr) {
      return idx === 0 ? 'Recently' : `${idx + 1} days ago`;
    }
    const diffDays = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  const displayItems = evidence.slice(0, 3).map((e, idx) => {
    const photo = localStorage.getItem(`evidence_photo_${e.id}`) || e.photoUrl;
    return {
      id: e.id,
      title: e.title,
      type: e.verified ? 'Institutional Verified' : `${e.evidenceType || 'Project'} Evidence Submitted`,
      time: getRelativeTime(e.createdAt, idx),
      iconType: e.verified ? 'check' : 'code',
      dotColor: e.verified ? '#10B981' : '#3B82F6',
      photo,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between min-h-[260px]">
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

      {/* Main Content */}
      {!hasEvidence ? (
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-blue-50/80 text-blue-600 flex items-center justify-center border border-blue-100">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-[240px]">
            <h4 className="text-xs font-bold text-slate-800">No Evidence Uploaded Yet</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Add your first project or credential to build your verified timeline.
            </p>
          </div>
          <Link
            to="/evidence"
            className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <span>Upload Evidence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5 pt-3 relative">
          {/* Continuous Connecting Line */}
          <div className="absolute left-[18px] top-6 bottom-6 w-0.5 bg-slate-200" />

          {displayItems.map((item) => (
            <div key={item.id} className="relative flex items-center justify-between gap-3 z-10">
              <div className="flex items-center gap-3 min-w-0">
                {/* Thumbnail Photo or Icon Circle */}
                {item.photo ? (
                  <div className="relative w-9 h-9 shrink-0">
                    <img
                      src={item.photo}
                      alt={item.title}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 shadow-2xs"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                      <Check className="w-2 h-2 text-white stroke-[3]" />
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-2xs"
                    style={{
                      backgroundColor: item.iconType === 'check' ? '#10B981' : '#EFF6FF',
                      color: item.iconType === 'check' ? '#FFFFFF' : '#2563EB',
                    }}
                  >
                    {item.iconType === 'check' ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <Code2 className="w-4 h-4" />
                    )}
                  </div>
                )}

                {/* Title & Subtitle */}
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5 truncate">
                    {item.type}
                  </p>
                </div>
              </div>

              {/* Time Stamp */}
              <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap shrink-0">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvidenceTimelineCard;
