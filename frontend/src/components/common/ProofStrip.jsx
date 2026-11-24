import React from 'react';
import { ShieldCheck, Calendar, Building, ExternalLink } from 'lucide-react';
import { EvidenceLadderBadge } from './EvidenceLadderBadge';

/**
 * Signature component: Proof strip per skill showing verification provenance:
 * who verified, organization, when, and link to artifact.
 */
export const ProofStrip = ({
  skillName,
  level = 'VERIFIED',
  verifierName,
  organizationName,
  verifiedAt,
  evidenceUrl,
  className = '',
}) => {
  return (
    <div
      className={`kasumo-card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <EvidenceLadderBadge level={level} size="sm" />
        <span className="font-semibold text-ink text-sm">{skillName}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-ink-muted">
        {organizationName && (
          <span className="inline-flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-verified" aria-hidden="true" />
            <span>{organizationName}</span>
            {verifierName && <span className="text-ink-subtle">({verifierName})</span>}
          </span>
        )}

        {verifiedAt && (
          <span className="inline-flex items-center gap-1 font-mono text-xs">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{new Date(verifiedAt).toLocaleDateString()}</span>
          </span>
        )}

        {evidenceUrl && (
          <a
            href={evidenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-verified hover:text-verified-hover font-medium underline underline-offset-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified"
          >
            <span>Proof Source</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
};

export default ProofStrip;
