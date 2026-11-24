import React from 'react';
import { CircleDot, FileCode, ShieldCheck, Terminal } from 'lucide-react';

/**
 * Maps EvidenceLevel and DemonstratedLevel to the 4-tier Evidence Ladder:
 * Claimed > Evidenced > Verified > Demonstrated
 * Always renders both distinctive shape/icon AND descriptive text label (never color alone).
 */
export const EvidenceLadderBadge = ({ level, size = 'md', className = '' }) => {
  // Normalize string
  const norm = String(level || 'CLAIMED').toUpperCase();

  let tier = 'CLAIMED';
  if (['DEMONSTRATED', 'EXCELLENT', 'FOUNDATIONAL', 'MEDIUM'].includes(norm)) {
    tier = 'DEMONSTRATED';
  } else if (['VERIFIED', 'AUDITED'].includes(norm)) {
    tier = 'VERIFIED';
  } else if (
    [
      'EVIDENCED',
      'WEAK',
      'MODERATE',
      'STRONG',
      'WEAK_EVIDENCE',
      'LIMITED_EVIDENCE',
      'MODERATE_EVIDENCE',
      'STRONG_EVIDENCE',
      'PROJECT',
      'CERTIFICATE',
    ].includes(norm)
  ) {
    tier = 'EVIDENCED';
  }

  const config = {
    CLAIMED: {
      label: 'Claimed',
      icon: CircleDot,
      containerClasses: 'bg-paper-subtle text-ink-muted border-paper-border',
      shapeSymbol: '○',
    },
    EVIDENCED: {
      label: 'Evidenced',
      icon: FileCode,
      containerClasses: 'bg-unverified-light text-unverified border-unverified-border',
      shapeSymbol: '◐',
    },
    VERIFIED: {
      label: 'Verified',
      icon: ShieldCheck,
      containerClasses: 'bg-verified-light text-verified border-verified-border font-semibold',
      shapeSymbol: '🛡',
    },
    DEMONSTRATED: {
      label: 'Demonstrated',
      icon: Terminal,
      containerClasses: 'bg-slate-900 text-white border-slate-700 font-semibold',
      shapeSymbol: '◆',
    },
  }[tier];

  const Icon = config.icon;
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${
        isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      } ${config.containerClasses} ${className}`}
      title={`Evidence Ladder Tier: ${config.label}`}
    >
      <span className="font-mono text-xs select-none" aria-hidden="true">
        {config.shapeSymbol}
      </span>
      <Icon className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};

export default EvidenceLadderBadge;
