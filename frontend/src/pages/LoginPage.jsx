import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { checkBackendHealth } from '../api/client';
import { Alert } from '../components/common/Alert';
import { Lock, Mail, ArrowRight, Sparkles, Building, GraduationCap, RefreshCw, Server } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [testingConn, setTestingConn] = useState(false);
  const [connResult, setConnResult] = useState(null);
  const [showEditUrl, setShowEditUrl] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const activeUrl = typeof window !== 'undefined' ? (window.localStorage?.getItem('kasumio_api_url') || import.meta.env?.VITE_API_BASE_URL || '/api') : '/api';

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleTestConnection = async () => {
    setTestingConn(true);
    setConnResult(null);
    try {
      const isUp = await checkBackendHealth();
      if (isUp) {
        setConnResult({ success: true, message: 'Online & Responding' });
      } else {
        setConnResult({ success: false, message: 'Unhealthy response' });
      }
    } catch {
      setConnResult({ success: false, message: 'Unreachable (Server sleeping or URL invalid)' });
    } finally {
      setTestingConn(false);
    }
  };

  const handleSaveUrl = () => {
    if (customUrl && customUrl.trim()) {
      let clean = customUrl.trim().replace(/\/+$/, '');
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = 'https://' + clean;
      }
      localStorage.setItem('kasumio_api_url', clean);
      window.location.reload();
    }
  };

  const handleQuickDemo = async (role) => {
    setError(null);
    setSubmitting(true);
    const emailToUse = role === 'RECRUITER' ? 'recruiter@kasumo.internal' : 'student@kasumo.internal';
    const pwd = 'password123';
    try {
      await login(emailToUse, pwd);
      navigate(from, { replace: true });
    } catch (err) {
      // In-memory H2 fallback: auto-register and sign in
      try {
        await authApi.register({
          email: emailToUse,
          password: pwd,
          fullName: role === 'RECRUITER' ? 'Sarah Jenkins (Lead Recruiter)' : 'Alex Mercer (Full-Stack Student)',
          role: role,
          organizationName: role === 'RECRUITER' ? 'Apex Systems' : 'Stanford University',
        });
        await login(emailToUse, pwd);
        navigate(from, { replace: true });
      } catch (regErr) {
        setError('Failed to initiate quick demo session.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Platform Identity */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-sm">
            K
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            KASUMIO
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium max-w-xs mx-auto">
            Career-Intelligence Platform
          </p>
        </div>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white border border-slate-200 py-8 px-6 sm:px-10 rounded-3xl shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Sign in to your account</h3>
            <p className="text-xs text-slate-500 mt-1">
              Access your verifiable skill evidence and career profile.
            </p>
          </div>

          <Alert type="error" message={error} onClose={() => setError(null)} />

          {error && (error.includes('backend server') || error.includes('free-tier') || error.includes('Network Error')) && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-2">
              <div className="flex items-center justify-between text-amber-900 font-medium">
                <span className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-amber-600" />
                  Target Backend:
                </span>
                <code className="bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded font-mono text-[11px] truncate max-w-[200px]" title={activeUrl}>
                  {activeUrl}
                </code>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testingConn}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/50 rounded-lg font-medium transition shadow-2xs"
                  >
                    <RefreshCw className={`w-3 h-3 ${testingConn ? 'animate-spin' : ''}`} />
                    {testingConn ? 'Testing...' : 'Test Connection'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditUrl(!showEditUrl)}
                    className="text-amber-800 hover:text-amber-950 underline font-medium"
                  >
                    {showEditUrl ? 'Cancel' : 'Change URL'}
                  </button>
                </div>

                {connResult && (
                  <span className={`text-[11px] font-semibold ${connResult.success ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {connResult.message}
                  </span>
                )}
              </div>

              {showEditUrl && (
                <div className="flex items-center gap-1.5 pt-1.5">
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://kasumio-backend.onrender.com"
                    className="flex-1 bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveUrl}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none transition-all shadow-xs disabled:opacity-50 active:scale-98"
              >
                <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-2 space-y-2.5">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ⚡ Quick Demo Access
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickDemo('RECRUITER')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold border border-slate-200 hover:border-indigo-200 transition"
              >
                <Building className="w-3.5 h-3.5 text-indigo-600" />
                <span>Recruiter Demo</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickDemo('STUDENT')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold border border-slate-200 hover:border-indigo-200 transition"
              >
                <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                <span>Student Demo</span>
              </button>
            </div>
          </div>

          {/* Registration Redirect */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition underline underline-offset-2"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
