import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

/**
 * Accessible confirmation dialog replacing window.confirm.
 */
export const ConfirmDialog = ({
  isOpen,
  title = 'Please Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {isDanger && (
            <div className="p-2 rounded-full bg-rose-100 text-rose-600 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
          )}
          <p className="text-sm text-slate-600 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500'
                : 'bg-teal-700 hover:bg-teal-800 focus-visible:ring-teal-600'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
