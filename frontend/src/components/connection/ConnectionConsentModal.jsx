import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  Eye
} from 'lucide-react';
import { Modal } from '../common/Modal';

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
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
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
      setError(err.response?.data?.message || 'Failed to submit connection consent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Establish Trusted Connection"
      description={`Connecting for ${connection.opportunityTitle} at ${connection.organizationName}`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">
        {error && (
          <div role="alert" className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={handleSubmit}
              className="ml-3 underline font-semibold text-rose-900 hover:text-rose-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
            >
              Retry
            </button>
          </div>
        )}

        {/* Identity control notice */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 text-xs text-teal-950 space-y-1">
          <p className="font-semibold text-teal-900 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
            <span>You control your identity</span>
          </p>
          <p className="text-slate-700 leading-relaxed text-xs">
            Only information explicitly enabled below will be shared with the recruiter. All other profile details remain strictly confidential and protected.
          </p>
        </div>

        {/* Recruiter Context */}
        {connection.recruiterNote && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Message from Recruiter
            </span>
            <p className="text-xs text-slate-800 italic">
              "{connection.recruiterNote}"
            </p>
          </div>
        )}

        {/* Disclosure Options */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Choose What Information to Disclose
          </span>

          {/* Full Name */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition">
            <input
              type="checkbox"
              id="consent-share-fullname"
              checked={shareFullName}
              onChange={(e) => setShareFullName(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
            />
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-teal-700" aria-hidden="true" />
                  <span>Full Name</span>
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {studentProfile?.fullName || 'Alice Candidate'}
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                Allows the recruiter to identify you by name.
              </p>
            </div>
          </label>

          {/* Email */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition">
            <input
              type="checkbox"
              id="consent-share-email"
              checked={shareEmail}
              onChange={(e) => setShareEmail(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
            />
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-teal-700" aria-hidden="true" />
                  <span>Email Address</span>
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {studentProfile?.email || 'student@university.edu'}
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                Permits the recruiter to contact you directly via your registered email.
              </p>
            </div>
          </label>

          {/* Academic Background */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition">
            <input
              type="checkbox"
              id="consent-share-academic"
              checked={shareUniversity}
              onChange={(e) => {
                setShareUniversity(e.target.checked);
                setShareGraduationYear(e.target.checked);
              }}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
            />
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-teal-700" aria-hidden="true" />
                  <span>Academic Background</span>
                </span>
                <span className="text-xs text-slate-500">
                  {studentProfile?.university ? `${studentProfile.university}${studentProfile.graduationYear ? ` ('${studentProfile.graduationYear.toString().slice(-2)})` : ''}` : 'University & Class'}
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                Shares your university name and expected graduation year.
              </p>
            </div>
          </label>

          {/* Bio */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition">
            <input
              type="checkbox"
              id="consent-share-bio"
              checked={shareBio}
              onChange={(e) => setShareBio(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
            />
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-700" aria-hidden="true" />
                  <span>Bio / Personal Statement</span>
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                Shares your profile biography statement.
              </p>
            </div>
          </label>
        </div>

        {/* Optional Note */}
        <div className="space-y-1.5">
          <label htmlFor="consent-custom-message" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Optional Note to Recruiter
          </label>
          <textarea
            id="consent-custom-message"
            rows={2}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="e.g., Excited to discuss this opportunity! Feel free to reach out."
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
          />
        </div>

        {/* Live Preview */}
        <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 space-y-2">
          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
            Preview — What the Recruiter Will See
          </span>
          <div className="text-xs space-y-1 text-slate-700">
            <p>
              <span className="text-slate-500">Name:</span>{' '}
              <span className="font-semibold text-slate-900">
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
                <span className="italic text-slate-800">"{customMessage.trim()}"</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 bg-white border border-slate-300 rounded-lg transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg shadow-xs transition disabled:opacity-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>{submitting ? 'Connecting...' : 'Confirm & Establish Connection'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
