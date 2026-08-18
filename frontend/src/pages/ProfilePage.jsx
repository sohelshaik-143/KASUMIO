import React, { useState, useEffect } from 'react';
import { studentApi } from '../api/studentApi';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { User, School, Calendar, BookOpen, Save, CheckCircle2 } from 'lucide-react';

export const ProfilePage = () => {
  const { user, isStudent, loading: authLoading, refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    university: '',
    graduationYear: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: null, message: null });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await studentApi.getProfile();
        setProfile({
          fullName: data.fullName || '',
          university: data.university || '',
          graduationYear: data.graduationYear || '',
          bio: data.bio || '',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
        const errMsg = err.response?.data?.message || 'Could not load your student profile.';
        setAlert({ type: 'error', message: errMsg });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user && isStudent) {
      fetchProfile();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user?.id, user?.role, isStudent]);

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: null, message: null });
    setSaving(true);

    try {
      const payload = {
        fullName: profile.fullName,
        university: profile.university || null,
        graduationYear: profile.graduationYear ? Number(profile.graduationYear) : null,
        bio: profile.bio || null,
      };

      await studentApi.updateProfile(payload);
      await refreshUser();
      setAlert({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.validationErrors
        ? Object.values(err.response.data.validationErrors).join(', ')
        : 'Failed to update profile.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <LoadingSpinner size="lg" text="Loading student profile..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl animate-in fade-in-50 duration-200">
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Student Profile</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Maintain your identity and academic background for institutional verification and selective disclosure.
        </p>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 sm:p-7 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Account Email (Read-Only) */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Account Email
            </label>
            <input
              type="text"
              disabled
              value={user?.email || ''}
              className="w-full bg-slate-850/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-400 cursor-not-allowed font-mono"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-teal-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                maxLength={255}
                placeholder="Your full legal or professional name"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full bg-slate-850 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          {/* University */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              College / University
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <School className="w-4 h-4" />
              </div>
              <input
                type="text"
                maxLength={255}
                placeholder="e.g. Indian Institute of Technology / Stanford University"
                value={profile.university}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                className="w-full bg-slate-850 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          {/* Graduation Year */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Graduation Year
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="number"
                min={1970}
                max={2100}
                placeholder="e.g. 2026"
                value={profile.graduationYear}
                onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                className="w-full bg-slate-850 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Professional Biography
            </label>
            <textarea
              rows={4}
              maxLength={1000}
              placeholder="Brief summary of your technical interests, strengths, and engineering focus..."
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 resize-none transition"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50 active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
