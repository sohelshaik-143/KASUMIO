import React from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Calendar, 
  Layers, 
  FileText,
  Clock
} from 'lucide-react';

export const EvidenceCard = ({ 
  evidence, 
  onEdit, 
  onDelete, 
  onVerify,
  canVerify = false,
  showOwner = false 
}) => {
  const typeBadgeColors = {
    PROJECT: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
    CERTIFICATE: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    PUBLICATION: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
    OTHER: 'bg-slate-800/80 text-slate-300 border-slate-700',
  };

  const formattedDate = new Date(evidence.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between group shadow-sm">
      <div>
        {/* Header: Skill & Evidence Type */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-950/80 text-teal-300 border border-teal-800/60 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-teal-400" />
              {evidence.skillName}
            </span>
            <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border uppercase tracking-wider ${typeBadgeColors[evidence.evidenceType] || typeBadgeColors.OTHER}`}>
              {evidence.evidenceType}
            </span>
          </div>

          {/* Verification Badge */}
          {evidence.verified ? (
            <div 
              title={`Verified by ${evidence.verification?.organizationName || 'Authorized Organization'}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[140px]">Verified: {evidence.verification?.organizationName || 'Organization'}</span>
            </div>
          ) : (
            <div 
              title="Awaiting verification by an accredited institution or organization"
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-850 text-slate-400 border border-slate-700/70"
            >
              <Clock className="w-3 h-3" />
              <span>Unverified</span>
            </div>
          )}
        </div>

        {/* Student Owner */}
        {showOwner && evidence.studentName && (
          <p className="text-xs text-slate-400 mb-2">
            Candidate: <span className="text-slate-200 font-semibold">{evidence.studentName}</span>
          </p>
        )}

        {/* Title */}
        <h3 className="text-base font-bold text-white mb-2 group-hover:text-teal-200 transition-colors tracking-tight">
          {evidence.title}
        </h3>

        {/* Description */}
        {evidence.description && (
          <p className="text-xs sm:text-sm text-slate-300/90 line-clamp-3 mb-3 leading-relaxed">
            {evidence.description}
          </p>
        )}

        {/* Opportunity-Specific Verification Provenance */}
        {evidence.opportunityVerifications && evidence.opportunityVerifications.length > 0 && (
          <div className="space-y-1.5 mb-3 bg-slate-925/90 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Opportunity Verification Provenance
            </span>
            <div className="flex flex-wrap gap-1.5">
              {evidence.opportunityVerifications.map((v, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg border ${
                    v.status === 'VERIFIED'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      : v.status === 'REQUESTED'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                      : v.status === 'REJECTED'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {v.status === 'VERIFIED' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  {v.status === 'REQUESTED' && <Clock className="w-3 h-3 text-amber-400" />}
                  <span>
                    {v.status === 'VERIFIED' && `✓ Verified for ${v.opportunityTitle}`}
                    {v.status === 'REQUESTED' && `Verification requested (${v.opportunityTitle})`}
                    {v.status === 'REJECTED' && `Verification not accepted (${v.opportunityTitle})`}
                    {v.status === 'EXPIRED' && `Request expired (${v.opportunityTitle})`}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Links / Actions */}
      <div className="pt-3.5 border-t border-slate-800/80 mt-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-400 text-[11px]">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <a
            href={evidence.evidenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-semibold transition"
          >
            <span>Inspect Proof</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Edit / Delete / Verify buttons */}
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(evidence)}
              title="Edit Evidence"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(evidence.id)}
              title="Delete Evidence"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {canVerify && !evidence.verified && onVerify && (
            <button
              onClick={() => onVerify(evidence.id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verify</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
