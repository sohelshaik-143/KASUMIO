import React, { useState } from 'react';
import { 
  UserCheck, 
  Mail, 
  GraduationCap, 
  FileText, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  Calendar,
  MessageSquare,
  Building,
  UserX,
  Clock
} from 'lucide-react';

export const DisclosedProfileModal = ({
  isOpen,
  onClose,
  connection,
  onCancelConnection
}) => {
  if (!isOpen || !connection) return null;

  const profile = connection.disclosedProfile;
  const [revoking, setRevoking] = useState(false);

  const handleRevoke = async () => {
    if (!window.confirm('Are you sure you want to disconnect? Identity disclosure will terminate immediately.')) {
      return;
    }
    try {
      setRevoking(true);
      await onCancelConnection(connection.id);
      onClose();
    } catch (err) {
      console.error('Failed to cancel connection:', err);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in-50 duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700/80">
                <ShieldCheck className="w-3.5 h-3.5" />
                Mutual Connection Established
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {profile?.fullName || `Candidate ${connection.candidateAlias}`}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Opportunity: <span className="text-slate-200 font-semibold">{connection.opportunityTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Transparency Tag */}
          <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-3.5 text-xs text-slate-300">
            <p className="font-semibold text-emerald-300 mb-0.5">
              Approved Professional Information
            </p>
            <p className="text-[11px] text-slate-300/90 leading-relaxed">
              This candidate explicitly consented to disclose the fields below for this recruitment connection on {connection.respondedAt ? new Date(connection.respondedAt).toLocaleDateString() : 'recent date'}.
            </p>
          </div>

          {/* Student Disclosed Message */}
          {profile?.customMessage && (
            <div className="bg-slate-850/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">
                Candidate Note
              </span>
              <p className="text-xs text-slate-200 italic">
                "{profile.customMessage}"
              </p>
            </div>
          )}

          {/* Contact Details Card */}
          <div className="bg-slate-925/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3.5">
            {/* Email / Contact */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Contact Email
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white">
                    {profile?.email || <span className="text-xs text-slate-500 font-normal italic">Kept private by candidate</span>}
                  </span>
                </div>
              </div>

              {profile?.email && (
                <a
                  href={`mailto:${profile.email}?subject=Regarding Opportunity: ${encodeURIComponent(connection.opportunityTitle)}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-98"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </a>
              )}
            </div>

            {/* Academic background */}
            <div className="border-t border-slate-800 pt-3 flex items-center gap-2.5 text-xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Education
                </span>
                <span className="text-xs text-slate-200 font-medium">
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
              <div className="border-t border-slate-800 pt-3 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span>Bio / Statement</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>

          {/* Connection Metadata */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              Connected: {new Date(connection.createdAt).toLocaleDateString()}
            </span>
            <button
              type="button"
              disabled={revoking}
              onClick={handleRevoke}
              className="text-xs text-rose-400 hover:text-rose-300 underline underline-offset-2 transition"
            >
              {revoking ? 'Disconnecting...' : 'Revoke Connection'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-750 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
