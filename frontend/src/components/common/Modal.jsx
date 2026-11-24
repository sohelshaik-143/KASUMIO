import React, { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible Modal Dialog Component adhering to WCAG 2.2 AA.
 * Features:
 * - role="dialog" & aria-modal="true"
 * - Focus trap & focus restoration on close
 * - Escape key to close
 * - aria-labelledby & aria-describedby associations
 * - Accessible close button with clear focus ring
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-2xl',
  className = '',
  ariaLabel,
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the modal or first focusable element
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusable = modalRef.current?.querySelectorAll(focusableSelector);
    if (focusable && focusable.length > 0) {
      focusable[0].focus();
    } else {
      modalRef.current?.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusables = Array.from(
          modalRef.current.querySelectorAll(focusableSelector)
        ).filter((el) => !el.hasAttribute('disabled'));

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        className={`bg-white text-slate-900 border border-slate-200 rounded-2xl w-full ${maxWidth} p-6 shadow-2xl relative my-6 focus:outline-hidden ${className}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {title && (
          <div className="mb-4 pr-8">
            <h2 id={titleId} className="text-xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
            {description && (
              <p id={descId} className="text-sm text-slate-600 mt-1">
                {description}
              </p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};
