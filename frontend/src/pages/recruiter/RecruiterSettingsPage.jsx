import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { User, Mail, Camera, Trash2, Save, ShieldCheck, Bell } from 'lucide-react';
import { Alert } from '../../components/common/Alert';

export const RecruiterSettingsPage = () => {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState(user?.fullName || 'Arjun Reddy');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [jobTitle, setJobTitle] = useState('Lead Technical Recruiter');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [alert, setAlert] = useState({ type: null, message: null });

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
        setAvatarUrl(res.avatarUrl);
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
      setAvatarUrl('');
      await refreshUser();
      setAlert({ type: 'success', message: 'Profile photo removed.' });
    } catch (err) {
      console.error('Failed to remove photo:', err);
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to remove photo.' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setAlert({ type: null, message: null });
      await authApi.updateProfile({
        fullName: fullName.trim(),
        avatarUrl: avatarUrl || null
      });
      await refreshUser();
      setAlert({ type: 'success', message: 'Settings saved successfully.' });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-200">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Recruiter Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your verified recruiter credentials, photo, and preferences.
        </p>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: null, message: null })} />

      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs space-y-6">
        {/* Profile Photo Section */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
            Profile Photo
          </label>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Recruiter Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-slate-400 uppercase">
                  {fullName.charAt(0)}
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl transition disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{uploadingPhoto ? 'Uploading...' : 'Change Photo'}</span>
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handlePhotoRemove}
                  disabled={uploadingPhoto}
                  className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
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

        {/* Email Read-only */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
            Account Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              disabled
              value={user?.email || ''}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-500 font-mono cursor-not-allowed"
            />
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
            Full Name <span className="text-blue-600">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
            Professional Title
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
