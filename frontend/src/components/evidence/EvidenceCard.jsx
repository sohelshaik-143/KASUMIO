import React from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Calendar, 
  Layers, 
  Clock
} from 'lucide-react';
import { EvidenceLadderBadge } from '../common/EvidenceLadderBadge';

export const EvidenceCard = ({ 
  evidence, 
  onEdit, 
  onDelete, 
  onVerify, 
  canVerify = false,
  showOwner = false 
}) => {
  const formattedDate = new Date(evidence.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const level = evidence.verified ? 'VERIFIED' : 'EVIDENCED';

  return (
    <div className="kasumo-card p-5 sm:p-6 transition flex flex-col justify-between group">
      <div>
        {/* Header: Skill & Ladder Tier */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-paper-subtle text-ink border border-paper-border flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-verified" aria-hidden="true" />
              {evidence.skillName}
            </span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md border border-paper-border bg-white text-ink-muted uppercase">
              {evidence.evidenceType}
            </span>
          </div>

          {/* Evidence Ladder Tier Badge */}
          <EvidenceLadderBadge level={level} size="sm" />
        </div>

        {/* Candidate Owner */}
        {showOwner && evidence.studentName && (
          <p className="text-xs text-ink-muted mb-2">
            Candidate: <span className="text-ink font-semibold">{evidence.studentName}</span>
          </p>
        )}

        {/* Title */}
        <h3 className="text-base font-bold text-ink mb-2 font-serif tracking-tight">
          {evidence.title}
        </h3>

        {/* Description */}
        {evidence.description && (
          <p className="text-xs sm:text-sm text-ink-muted line-clamp-3 mb-3 leading-relaxed">
            {evidence.description}
          </p>
        )}

        {/* Opportunity-Specific Verification Provenance */}
        {evidence.opportunityVerifications && evidence.opportunityVerifications.length > 0 && (
          <div className="space-y-1.5 mb-3 bg-paper-subtle p-3 rounded-lg border border-paper-border">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
              Opportunity Verification Provenance
            </span>
            <div className="flex flex-wrap gap-1.5">
              {evidence.opportunityVerifications.map((v, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border ${
                    v.status === 'VERIFIED'
                      ? 'bg-verified-light text-verified border-verified-border'
                      : v.status === 'REQUESTED'
                      ? 'bg-unverified-light text-unverified border-unverified-border'
                      : v.status === 'REJECTED'
                      ? 'bg-gap-light text-gap border-gap-border'
                      : 'bg-paper text-ink-muted border-paper-border'
                  }`}
                >
                  {v.status === 'VERIFIED' && <CheckCircle2 className="w-3.5 h-3.5 text-verified" aria-hidden="true" />}
                  {v.status === 'REQUESTED' && <Clock className="w-3.5 h-3.5 text-unverified" aria-hidden="true" />}
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
      <div className="pt-3.5 border-t border-paper-border mt-2 flex items-center justify-between text-xs text-ink-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-xs">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            {formattedDate}
          </span>
          <a
            href={evidence.evidenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-verified hover:text-verified-hover font-semibold transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified rounded"
          >
            <span>Inspect Proof</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>

        {/* Edit / Delete / Verify buttons */}
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(evidence)}
              aria-label={`Edit ${evidence.title}`}
              className="p-1.5 text-ink-muted hover:text-ink hover:bg-paper-subtle rounded-md transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified"
            >
              <Edit3 className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(evidence.id)}
              aria-label={`Delete ${evidence.title}`}
              className="p-1.5 text-ink-muted hover:text-gap hover:bg-paper-subtle rounded-md transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gap"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          {canVerify && !evidence.verified && onVerify && (
            <button
              type="button"
              onClick={() => onVerify(evidence.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-verified hover:bg-verified-hover text-white text-xs font-semibold rounded-md transition shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified focus-visible:ring-offset-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Verify</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvidenceCard;
