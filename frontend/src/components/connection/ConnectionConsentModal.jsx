import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Mail, 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  X, 
  Eye, 
  AlertCircle,
  MessageSquare,
  Building
} from 'lucide-react';

export const ConnectionConsentModal = ({ 
  isOpen, 
  onClose, 
  connection, 
  studentProfile,
  onConfirm 
}) => {
  if (!isOpen || !connection) return null;

  const [shareFullName, setShareFullName] = useState(true);
  const [shareEmail, setShareEmail] = useState(false);
  const [shareUniversity, setShareUniversity] = useState(false);
  const [shareGraduationYear, setShareGraduationYear] = useState(false);
  const [shareBio, setShareBio] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onConfirm({
        shareFullName,
        shareEmail,
        shareUniversity,
        shareGraduationYear,
        shareBio,
        customMessage: customMessage.trim() || null,
      });
      onClose();
    } catch (err) {
      console.error('Failed to submit connection consent:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in-50 duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Establish Trusted Connection
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Connecting for <span className="text-slate-200 font-semibold">{connection.opportunityTitle}</span> at <span className="text-teal-300 font-semibold">{connection.organizationName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Principle explanation banner */}
          <div className="bg-teal-950/40 border border-teal-800/40 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-teal-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-teal-400 shrink-0" />
              <span>You control your identity</span>
            </p>
            <p className="text-slate-300/90 leading-relaxed text-[11px]">
              Only information explicitly enabled below will be shared with the recruiter. All other profile details remain strictly confidential and protected.
            </p>
          </div>

          {/* Recruiter Context */}
          {connection.recruiterNote && (
            <div className="bg-slate-850/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Message from Recruiter
              </span>
              <p className="text-xs text-slate-200 italic">
                "{connection.recruiterNote}"
              </p>
            </div>
          )}

          {/* Disclosure Options */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Choose What Information to Disclose
            </label>

            {/* Full Name */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-850 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition">
              <input
                type="checkbox"
                checked={shareFullName}
                onChange={(e) => setShareFullName(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 text-teal-600 focus:ring-teal-500 bg-slate-900"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-400" />
                    <span>Full Name</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {studentProfile?.fullName || 'Alice Candidate'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Allows the recruiter to identify you by name.
                </p>
              </div>
            </label>

            {/* Email */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-850 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition">
              <input
                type="checkbox"
                checked={shareEmail}
                onChange={(e) => setShareEmail(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 text-teal-600 focus:ring-teal-500 bg-slate-900"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-400" />
                    <span>Email Address</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {studentProfile?.email || 'student@university.edu'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Permits the recruiter to contact you directly via your registered email.
                </p>
              </div>
            </label>

            {/* University & Grad Year */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-850 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition">
              <input
                type="checkbox"
                checked={shareUniversity}
                onChange={(e) => {
                  setShareUniversity(e.target.checked);
                  setShareGraduationYear(e.target.checked);
                }}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 text-teal-600 focus:ring-teal-500 bg-slate-900"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                    <span>Academic Background</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {studentProfile?.university ? `${studentProfile.university}${studentProfile.graduationYear ? ` ('${studentProfile.graduationYear.toString().slice(-2)})` : ''}` : 'University & Class'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Shares your university name and expected graduation year.
                </p>
              </div>
            </label>

            {/* Bio */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-850 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition">
              <input
                type="checkbox"
                checked={shareBio}
                onChange={(e) => setShareBio(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 text-teal-600 focus:ring-teal-500 bg-slate-900"
              />
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-400" />
                    <span>Bio / Personal Statement</span>
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Shares your profile biography statement.
                </p>
              </div>
            </label>
          </div>

          {/* Optional Response Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Optional Note to Recruiter
            </label>
            <textarea
              rows={2}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="e.g., Excited to discuss this opportunity! Feel free to reach out."
              className="w-full bg-slate-850 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          {/* Live Recruiter View Preview */}
          <div className="border border-slate-800 bg-slate-925/90 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">
              Live Preview — What the Recruiter Will See
            </span>
            <div className="text-xs space-y-1 text-slate-300">
              <p>
                <span className="text-slate-500">Name:</span>{' '}
                <span className="font-semibold text-white">
                  {shareFullName ? (studentProfile?.fullName || 'Alice Candidate') : 'Anonymous Candidate'}
                </span>
              </p>
              <p>
                <span className="text-slate-500">Email:</span>{' '}
                <span className="font-mono">
                  {shareEmail ? (studentProfile?.email || 'student@university.edu') : 'Hidden (Not shared)'}
                </span>
              </p>
              <p>
                <span className="text-slate-500">Education:</span>{' '}
                <span>
                  {shareUniversity ? (studentProfile?.university || 'University not specified') : 'Hidden (Not shared)'}
                </span>
              </p>
              <p>
                <span className="text-slate-500">Bio:</span>{' '}
                <span>
                  {shareBio ? (studentProfile?.bio || 'None provided') : 'Hidden (Not shared)'}
                </span>
              </p>
              {customMessage.trim() && (
                <p>
                  <span className="text-slate-500">Note:</span>{' '}
                  <span className="italic text-slate-200">"{customMessage.trim()}"</span>
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50 active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Connecting...' : 'Confirm & Establish Connection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
