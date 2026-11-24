import React, { useState } from 'react';
import { 
  Mail, 
  GraduationCap, 
  FileText, 
  ShieldCheck, 
  Clock
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const DisclosedProfileModal = ({
  isOpen,
  onClose,
  connection,
  onCancelConnection
}) => {
  if (!isOpen || !connection) return null;

  const profile = connection.disclosedProfile;
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);

  const handleConfirmRevoke = async () => {
    try {
      setError(null);
      setRevoking(true);
      if (onCancelConnection) {
        await onCancelConnection(connection.id);
      }
      setShowConfirmDisconnect(false);
      onClose();
    } catch (err) {
      console.error('Failed to cancel connection:', err);
      setError(err.response?.data?.message || 'Failed to cancel connection. Please try again.');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={profile?.fullName || `Candidate ${connection.candidateAlias}`}
        description={`Opportunity: ${connection.opportunityTitle}`}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
          {error && (
            <div role="alert" className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800">
              {error}
            </div>
          )}

          {/* Mutual Connection Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              <ShieldCheck className="w-4 h-4 text-teal-700" aria-hidden="true" />
              Mutual Connection Established
            </span>
          </div>

          {/* Transparency Tag */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 text-xs text-slate-700">
            <p className="font-semibold text-teal-900 mb-0.5">
              Approved Professional Information
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              This candidate explicitly consented to disclose the fields below for this recruitment connection on {connection.respondedAt ? new Date(connection.respondedAt).toLocaleDateString() : 'recent date'}.
            </p>
          </div>

          {/* Candidate Disclosed Note */}
          {profile?.customMessage && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                Candidate Note
              </span>
              <p className="text-sm text-slate-800 italic">
                "{profile.customMessage}"
              </p>
            </div>
          )}

          {/* Contact Details Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs">
            {/* Email / Contact */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-slate-500 block tracking-wider">
                    Contact Email
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {profile?.email || <span className="text-xs text-slate-500 font-normal italic">Kept private by candidate</span>}
                  </span>
                </div>
              </div>

              {profile?.email && (
                <a
                  href={`mailto:${profile.email}?subject=Regarding Opportunity: ${encodeURIComponent(connection.opportunityTitle)}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                >
                  <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Send Email</span>
                </a>
              )}
            </div>

            {/* Academic background */}
            <div className="border-t border-slate-100 pt-3 flex items-center gap-2.5 text-xs">
              <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-slate-500 block tracking-wider">
                  Education
                </span>
                <span className="text-xs text-slate-800 font-medium">
                  {profile?.university ? (
                    `${profile.university}${profile.graduationYear ? ` (Graduating ${profile.graduationYear})` : ''}`
                  ) : (
                    <span className="text-slate-500 italic">Kept private by candidate</span>
                  )}
                </span>
              </div>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <div className="border-t border-slate-100 pt-3 text-xs space-y-1">
                <span className="text-xs uppercase font-bold text-slate-500 flex items-center gap-1 tracking-wider">
                  <FileText className="w-4 h-4 text-teal-700" aria-hidden="true" />
                  <span>Bio / Statement</span>
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>

          {/* Connection Metadata */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              Connected: {new Date(connection.createdAt).toLocaleDateString()}
            </span>
            <button
              type="button"
              disabled={revoking}
              onClick={() => setShowConfirmDisconnect(true)}
              className="text-xs text-rose-700 hover:text-rose-900 underline underline-offset-2 transition font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
            >
              Disconnect
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2"
          >
            Close
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirmDisconnect}
        onClose={() => setShowConfirmDisconnect(false)}
        title="Revoke Connection"
        message="Are you sure you want to disconnect? Identity disclosure will terminate immediately."
        confirmLabel="Disconnect"
        isDanger={true}
        isLoading={revoking}
        onConfirm={handleConfirmRevoke}
      />
    </>
  );
};

export default DisclosedProfileModal;
