import React, { useId } from 'react';

/**
 * Accessible form Field wrapper ensuring:
 * - Proper <label htmlFor={id}> association
 * - Help text and error messages tied via aria-describedby
 * - aria-invalid state for inputs
 * - Required indicator
 */
export const Field = ({
  label,
  id: customId,
  hint,
  error,
  required = false,
  className = '',
  srOnlyLabel = false,
  children,
}) => {
  const autoId = useId();
  const fieldId = customId || autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const isInvalid = Boolean(error);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={fieldId}
          className={`block text-sm font-medium text-slate-700 ${
            srOnlyLabel ? 'sr-only' : ''
          }`}
        >
          {label}
          {required && (
            <span className="text-rose-500 ml-1" aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only">(required)</span>}
        </label>
      )}

      {typeof children === 'function'
        ? children({
            id: fieldId,
            hintId,
            errorId,
            describedBy,
            isInvalid,
          })
        : React.isValidElement(children)
        ? React.cloneElement(children, {
            id: children.props.id || fieldId,
            'aria-describedby':
              children.props['aria-describedby'] || describedBy,
            'aria-invalid': isInvalid ? 'true' : undefined,
          })
        : children}

      {hint && (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};
