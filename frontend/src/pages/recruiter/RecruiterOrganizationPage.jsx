import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { Building, Globe, ShieldCheck, Users, Mail, CheckCircle2, Save } from 'lucide-react';
import { Alert } from '../../components/common/Alert';

export const RecruiterOrganizationPage = () => {
  const { user } = useAuth();
  const [orgName, setOrgName] = useState(user?.organizationName || 'Acme Engineering');
  const [website, setWebsite] = useState('https://acme.example.com');
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: null, message: null });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await authApi.updateProfile({ organizationName: orgName });
      setAlert({ type: 'success', message: 'Organization profile updated successfully.' });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update organization profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-200">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>My Organisation</span>
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-100 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Employer
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Institutional identity and verification attestation credentials.
        </p>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: null, message: null })} />

      <form onSubmit={handleSave} className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
            Organisation Legal Name
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
            Company Website / Domain
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">
            Institutional Verification Status: APPROVED
          </span>
          <p className="text-slate-500 dark:text-slate-400">
            Your organization is authorized to audit and attest candidate proof submissions across technical domains.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Organization'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
