import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * Signature component: Restrained verified seal for audited credentials.
 */
export const VerifiedSeal = ({
  organizationName,
  date,
  size = 'md',
  className = '',
}) => {
  const isSmall = size === 'sm';

  return (
    <div
      className={`inline-flex items-center gap-2 border border-verified-border bg-verified-light text-verified rounded-lg ${
        isSmall ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
      } ${className}`}
      title="Verified Institutional Credential"
    >
      <div className="w-5 h-5 rounded-full bg-verified text-white flex items-center justify-center shrink-0">
        <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
      </div>
      <div className="leading-tight">
        <div className="font-semibold text-verified text-xs flex items-center gap-1">
          <span>KASUMIO VERIFIED</span>
        </div>
        {organizationName && (
          <div className="text-[11px] text-ink-muted">
            {organizationName}
            {date && ` • ${new Date(date).getFullYear()}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifiedSeal;
