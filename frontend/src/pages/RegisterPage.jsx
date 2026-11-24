import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orgApi } from '../api/orgApi';
import { Alert } from '../components/common/Alert';
import { Field } from '../components/common/Field';
import { Lock, Mail, User, Building, ArrowRight, ShieldCheck } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'STUDENT',
    organizationName: '',
  });
  const [, setOrganizations] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const orgs = await orgApi.getAllOrgs();
        setOrganizations(orgs || []);
      } catch (err) {
        console.error('Failed to load organizations:', err);
        setError('Unable to load organizations list. You may type your company name manually.');
      }
    };
    fetchOrgs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 10) {
      setError('Password must be at least 10 characters.');
      return;
    }

    if (formData.role === 'RECRUITER' && !formData.organizationName.trim()) {
      setError('Organization name is required for recruiter accounts.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        ...(formData.role === 'RECRUITER' ? { organizationName: formData.organizationName.trim() } : {}),
      };

      await register(payload);
      navigate('/', { replace: true });
    } catch (err) {
      let msg = 'Registration failed. Please check your information.';
      if (err.response?.data) {
        if (typeof err.response.data.message === 'string' && err.response.data.message.trim()) {
          msg = err.response.data.message;
        } else if (err.response.data.validationErrors) {
          msg = Object.values(err.response.data.validationErrors).join(', ');
        }
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-teal-800 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-xs">
            <ShieldCheck className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-serif">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-600 font-medium">
            Build your verifiable evidence footprint
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200 py-8 px-6 sm:px-8 rounded-2xl shadow-xs space-y-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Switcher */}
            <div>
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Account Type
              </span>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200" role="radiogroup" aria-label="Account Type">
                <button
                  type="button"
                  role="radio"
                  aria-checked={formData.role === 'STUDENT'}
                  onClick={() => setFormData({ ...formData, role: 'STUDENT', organizationName: '' })}
                  className={`min-h-[44px] py-2 px-3 rounded-lg text-xs font-semibold text-center transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 ${
                    formData.role === 'STUDENT'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Student / Candidate
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={formData.role === 'RECRUITER'}
                  onClick={() => setFormData({ ...formData, role: 'RECRUITER' })}
                  className={`min-h-[44px] py-2 px-3 rounded-lg text-xs font-semibold text-center transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 ${
                    formData.role === 'RECRUITER'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Recruiter / Verifier
                </button>
              </div>
            </div>

            {/* Full Name */}
            <Field label="Full Name" required>
              {({ id, describedBy, isInvalid }) => (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={isInvalid}
                    type="text"
                    required
                    placeholder="e.g. Alex Chen"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
                  />
                </div>
              )}
            </Field>

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
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
                  />
                </div>
              )}
            </Field>

            {/* Password */}
            <Field label="Password" required hint="Must be at least 10 characters">
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
                    minLength={10}
                    autoComplete="new-password"
                    placeholder="••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
                  />
                </div>
              )}
            </Field>

            {/* Recruiter Organization */}
            {formData.role === 'RECRUITER' && (
              <Field label="Organization Name" required hint="Recruiters start pending until organization is approved">
                {({ id, describedBy, isInvalid }) => (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <input
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={isInvalid}
                      type="text"
                      required
                      placeholder="e.g. Stripe, Acme Corp"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition"
                    />
                  </div>
                )}
              </Field>
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 transition shadow-xs disabled:opacity-50"
              >
                <span>{submitting ? 'Creating account...' : 'Register Account'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </form>

          {/* Login Redirect */}
          <div className="pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-teal-700 hover:text-teal-900 transition underline underline-offset-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
