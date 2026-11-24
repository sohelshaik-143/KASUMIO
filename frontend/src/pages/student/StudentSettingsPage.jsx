import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  KeyRound,
  QrCode,
  Copy,
  Check,
  Lock,
  Bell,
  Eye,
  AlertCircle,
  Smartphone,
  RefreshCw,
  Save
} from 'lucide-react';
import { Alert } from '../../components/common/Alert';

export const StudentSettingsPage = () => {
  const { user } = useAuth();
  const [alert, setAlert] = useState({ type: null, message: null });

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    return localStorage.getItem('kasumo_student_2fa') === 'true';
  });
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Preference toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [outreachNotifications, setOutreachNotifications] = useState(true);
  const [privacySelectiveDisclosure, setPrivacySelectiveDisclosure] = useState(true);
  const [anonymousBenchmarking, setAnonymousBenchmarking] = useState(false);

  const secretKey = 'KASU-MIO2-FA99-X7K2';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(secretKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleEnable2FA = (e) => {
    e.preventDefault();
    if (verificationCode.trim().length !== 6) {
      setAlert({ type: 'error', message: 'Please enter a valid 6-digit verification code.' });
      return;
    }

    // Generate random 8 backup codes
    const codes = Array.from({ length: 6 }, () =>
      Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000)
    );
    setBackupCodes(codes);
    setTwoFactorEnabled(true);
    setShowSetup2FA(false);
    localStorage.setItem('kasumo_student_2fa', 'true');
    setAlert({
      type: 'success',
      message: 'Two-Factor Authentication (2FA) is now active on your account! Please save your recovery backup codes below.'
    });
  };

  const handleDisable2FA = () => {
    setTwoFactorEnabled(false);
    setBackupCodes([]);
    localStorage.setItem('kasumo_student_2fa', 'false');
    setAlert({ type: 'info', message: 'Two-Factor Authentication has been disabled.' });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setAlert({ type: 'error', message: 'Current password is required.' });
      return;
    }
    if (newPassword.length < 8) {
      setAlert({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setAlert({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setUpdatingPassword(true);
    setTimeout(() => {
      setUpdatingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setAlert({ type: 'success', message: 'Account password updated successfully!' });
    }, 600);
  };

  const handleSavePreferences = () => {
    setAlert({ type: 'success', message: 'Notification and privacy preferences saved.' });
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl animate-in fade-in-50 duration-200">
      {/* Header - Student Portal Style */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Account & Security Settings
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage two-factor authentication, security credentials, notification preferences, and candidate privacy.
        </p>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: null, message: null })} />

      {/* Section 1: Two-Factor Authentication (2FA) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              twoFactorEnabled ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Two-Factor Authentication (2FA)
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  twoFactorEnabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {twoFactorEnabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Protect your student credentials, evidence footprint, and recruiter consent with an extra layer of security.
              </p>
            </div>
          </div>

          <div>
            {twoFactorEnabled ? (
              <button
                type="button"
                onClick={handleDisable2FA}
                className="px-3.5 py-2 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition"
              >
                Disable 2FA
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowSetup2FA(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Set Up 2FA
              </button>
            )}
          </div>
        </div>

        {/* 2FA Setup Panel */}
        {showSetup2FA && (
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>Authenticator App Configuration</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSetup2FA(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Scan this QR code with Google Authenticator, 1Password, or Authy, or manually enter the key below:
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
              {/* Simulated QR Code SVG */}
              <div className="w-32 h-32 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                  {/* Stylized QR Code matrix */}
                  <rect x="10" y="10" width="25" height="25" />
                  <rect x="15" y="15" width="15" height="15" fill="white" />
                  <rect x="18" y="18" width="9" height="9" />

                  <rect x="65" y="10" width="25" height="25" />
                  <rect x="70" y="15" width="15" height="15" fill="white" />
                  <rect x="73" y="18" width="9" height="9" />

                  <rect x="10" y="65" width="25" height="25" />
                  <rect x="15" y="70" width="15" height="15" fill="white" />
                  <rect x="18" y="73" width="9" height="9" />

                  <rect x="42" y="15" width="6" height="6" />
                  <rect x="42" y="30" width="6" height="6" />
                  <rect x="48" y="45" width="8" height="8" />
                  <rect x="65" y="45" width="10" height="6" />
                  <rect x="42" y="65" width="6" height="12" />
                  <rect x="65" y="75" width="15" height="8" />
                </svg>
              </div>

              <div className="space-y-3 flex-1 w-full">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Secret Key
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={secretKey}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 w-full"
                    />
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition shrink-0"
                      title="Copy Key"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleEnable2FA} className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Enter 6-Digit Authenticator Code
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-mono tracking-widest text-slate-900 w-36 text-center focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={verificationCode.length !== 6}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition"
                    >
                      Verify & Activate
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Backup Recovery Codes Display */}
        {twoFactorEnabled && backupCodes.length > 0 && (
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4" />
              <span>One-Time Recovery Backup Codes</span>
            </span>
            <p className="text-[11px] text-emerald-700">
              Save these recovery codes in a secure location. Each code can be used once if you lose access to your device.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs text-slate-800">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="bg-white p-2 rounded-lg border border-emerald-200/80 text-center font-bold">
                  {code}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Password & Authentication Credentials */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center gap-2.5">
          <KeyRound className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updatingPassword}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            {updatingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Section 3: Notification & Privacy Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Privacy & Notification Controls</h3>
          </div>
          <button
            type="button"
            onClick={handleSavePreferences}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>

        <div className="space-y-3 divide-y divide-slate-100 text-xs">
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="font-bold text-slate-900">Selective Contact Disclosure</p>
              <p className="text-slate-500 text-[11px]">
                Only disclose email and phone to recruiters after you explicitly accept their connection.
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacySelectiveDisclosure}
              onChange={(e) => setPrivacySelectiveDisclosure(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="font-bold text-slate-900">Recruiter Outreach Email Alerts</p>
              <p className="text-slate-500 text-[11px]">
                Receive instant emails when an accredited employer reaches out based on your code artifacts.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="font-bold text-slate-900">Assessment Readiness Reminders</p>
              <p className="text-slate-500 text-[11px]">
                Get notified when time-sensitive screening challenges are assigned for your applied roles.
              </p>
            </div>
            <input
              type="checkbox"
              checked={outreachNotifications}
              onChange={(e) => setOutreachNotifications(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
