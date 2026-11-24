import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { Alert } from '../components/common/Alert';
import { Field } from '../components/common/Field';
import { Lock, Mail, ArrowRight, Building, GraduationCap, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleQuickDemo = async (role) => {
    const emailToUse = role === 'RECRUITER' ? 'recruiter@kasumio.com' : 'student@kasumio.com';
    const demoPassword = 'password123';

    try {
      setSubmitting(true);
      setError(null);
      await login(emailToUse, demoPassword);
      navigate(from, { replace: true });
    } catch (err) {
      // In-memory H2 fallback: auto-register and sign in
      try {
        await authApi.register({
          email: emailToUse,
          password: demoPassword,
          role: role,
          fullName: role === 'RECRUITER' ? 'Recruiter Demo' : 'Student Demo',
          organizationName: role === 'RECRUITER' ? (user?.organizationName || undefined) : undefined,
          university: role === 'STUDENT' ? 'State University' : undefined,
        });
        await login(emailToUse, demoPassword);
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
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
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
    <div className="min-h-screen bg-warm-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Platform Identity */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-teal-800 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-xs">
            <ShieldCheck className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-serif">
            KASUMIO
          </h1>
          <p className="mt-1 text-sm text-slate-600 font-medium">
            Verifiable Skill & Evidence Infrastructure
          </p>
        </div>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200 py-8 px-6 sm:px-8 rounded-2xl shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Sign in to your account</h2>
            <p className="text-xs text-slate-600 mt-1">
              Access your verifiable skill evidence and career profile.
            </p>
          </div>

          <Alert type="error" message={error} onClose={() => setError(null)} />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <Field label="Email address" required>
              {({ id, describedBy, isInvalid }) => (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={isInvalid}
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
                  />
                </div>
              )}
            </Field>

            {/* Password */}
            <Field label="Password" required>
              {({ id, describedBy, isInvalid }) => (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={isInvalid}
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
                  />
                </div>
              )}
            </Field>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 transition shadow-xs disabled:opacity-50"
              >
                <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-2 space-y-2.5">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Demo Accounts
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickDemo('RECRUITER')}
                className="min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-slate-50 hover:bg-teal-50 hover:text-teal-900 text-slate-700 text-xs font-semibold border border-slate-200 hover:border-teal-300 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                <Building className="w-4 h-4 text-teal-700" aria-hidden="true" />
                <span>Recruiter Demo</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickDemo('STUDENT')}
                className="min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-slate-50 hover:bg-teal-50 hover:text-teal-900 text-slate-700 text-xs font-semibold border border-slate-200 hover:border-teal-300 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                <GraduationCap className="w-4 h-4 text-teal-700" aria-hidden="true" />
                <span>Student Demo</span>
              </button>
            </div>
          </div>

          {/* Registration Redirect */}
          <div className="pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-teal-700 hover:text-teal-900 transition underline underline-offset-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
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

export default LoginPage;
