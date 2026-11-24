import React, { useState, useEffect, useRef } from 'react';
import { studentApi } from '../api/studentApi';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { User, School, Calendar, BookOpen, Save, Camera, Trash2, Upload } from 'lucide-react';

export const ProfilePage = () => {
  const { user, isStudent, loading: authLoading, refreshUser } = useAuth();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    fullName: '',
    university: '',
    graduationYear: '',
    bio: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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
          avatarUrl: data.avatarUrl || user?.avatarUrl || '',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
        const errMsg = err.response?.data?.message || 'Could not load your student profile.';
        setAlert({ type: 'error', message: errMsg });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      if (isStudent) {
        fetchProfile();
      } else {
        setLoading(false);
      }
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

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setAlert({ type: 'error', message: 'Only JPG, PNG, and WebP images are supported.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAlert({ type: 'error', message: 'Profile photo cannot exceed 5MB.' });
      return;
    }

    try {
      setUploadingPhoto(true);
      setAlert({ type: null, message: null });
      const formData = new FormData();
      formData.append('file', file);
      const res = await authApi.uploadAvatar(formData);
      if (res?.avatarUrl) {
        setProfile((prev) => ({ ...prev, avatarUrl: res.avatarUrl }));
        await refreshUser();
        setAlert({ type: 'success', message: 'Profile photo updated successfully!' });
      }
    } catch (err) {
      console.error('Failed to upload photo:', err);
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to upload photo.' });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePhotoRemove = async () => {
    try {
      setUploadingPhoto(true);
      setAlert({ type: null, message: null });
      await authApi.deleteAvatar();
      setProfile((prev) => ({ ...prev, avatarUrl: '' }));
      await refreshUser();
      setAlert({ type: 'success', message: 'Profile photo removed.' });
    } catch (err) {
      console.error('Failed to remove photo:', err);
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to remove photo.' });
    } finally {
      setUploadingPhoto(false);
    }
  };

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

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl animate-in fade-in-50 duration-200">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Student Profile</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Maintain your identity and academic background for institutional verification and selective disclosure.
        </p>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Photo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-slate-400 uppercase">
                    {(profile.fullName || user?.email || 'S').charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition disabled:opacity-50"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{uploadingPhoto ? 'Uploading...' : 'Change Photo'}</span>
                </button>
                {profile.avatarUrl && (
                  <button
                    type="button"
                    onClick={handlePhotoRemove}
                    disabled={uploadingPhoto}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Remove photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              JPG, PNG, or WebP up to 5MB.
            </p>
          </div>

          {/* Account Email (Read-Only) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Account Email
            </label>
            <input
              type="text"
              disabled
              value={user?.email || ''}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-500 cursor-not-allowed font-mono"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-indigo-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                maxLength={255}
                placeholder="Your full legal or professional name"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* University */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              College / University
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <School className="w-4 h-4" />
              </div>
              <input
                type="text"
                maxLength={255}
                placeholder="e.g. Indian Institute of Technology, Bombay"
                value={profile.university}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Graduation Year */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Graduation Year
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="number"
                min={2000}
                max={2035}
                placeholder="e.g. 2026"
                value={profile.graduationYear}
                onChange={(e) => setProfile({ ...profile, graduationYear: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Short Bio / Technical Background
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <textarea
                rows={4}
                maxLength={1000}
                placeholder="Share your primary tech stack interests, research focus, or engineering background..."
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none transition"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
