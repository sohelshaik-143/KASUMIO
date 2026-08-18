import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase,
  ShieldCheck, 
  Layers, 
  Target, 
  User, 
  CheckSquare, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  Users,
  Compass,
  TrendingUp
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isStudent, isRecruiter, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItemClass = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive(path)
        ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-lg tracking-wider shadow-sm group-hover:scale-105 transition-transform">
                K
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-tight">KASUMIO</span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-800 text-teal-400 font-semibold border border-slate-700">
                  Foundation
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              <Link to="/" className={navItemClass('/')}>
                <Layers className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              {isStudent && (
                <>
                  <Link to="/student/discover" className={navItemClass('/student/discover')}>
                    <Compass className="w-4 h-4" />
                    <span>Discover</span>
                  </Link>

                  <Link to="/student/intelligence" className={navItemClass('/student/intelligence')}>
                    <Sparkles className="w-4 h-4" />
                    <span>Intelligence & What-If</span>
                  </Link>

                  <Link to="/student/gaps" className={navItemClass('/student/gaps')}>
                    <TrendingUp className="w-4 h-4" />
                    <span>Gap Roadmap</span>
                  </Link>

                  <Link to="/student/opportunities" className={navItemClass('/student/opportunities')}>
                    <Briefcase className="w-4 h-4" />
                    <span>Opportunities</span>
                  </Link>

                  <Link to="/student/connections" className={navItemClass('/student/connections')}>
                    <Users className="w-4 h-4" />
                    <span>Connections</span>
                  </Link>

                  <Link to="/evidence" className={navItemClass('/evidence')}>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Evidence</span>
                  </Link>

                  <Link to="/career-goals" className={navItemClass('/career-goals')}>
                    <Target className="w-4 h-4" />
                    <span>Career Goals</span>
                  </Link>

                  <Link to="/profile" className={navItemClass('/profile')}>
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </>
              )}

              {(isRecruiter || isAdmin) && (
                <>
                  <Link to="/recruiter/opportunities" className={navItemClass('/recruiter/opportunities')}>
                    <Briefcase className="w-4 h-4" />
                    <span>Opportunities</span>
                  </Link>

                  <Link to="/recruiter/connections" className={navItemClass('/recruiter/connections')}>
                    <Users className="w-4 h-4" />
                    <span>Connections</span>
                  </Link>

                  <Link to="/recruiter/verifications" className={navItemClass('/recruiter/verifications')}>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verification Queue</span>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* User Info & Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-200">
                    {user.fullName || user.email.split('@')[0]}
                  </p>
                  <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider bg-slate-800 text-teal-400 border border-slate-700">
                    {user.role} {user.organizationName ? `• ${user.organizationName}` : ''}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {user ? (
            <>
              <div className="px-3 py-2 bg-slate-850 rounded-lg mb-2">
                <p className="text-sm font-medium text-white">{user.fullName || user.email}</p>
                <span className="text-xs text-teal-400 font-semibold">{user.role}</span>
              </div>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
              >
                Dashboard
              </Link>
              {isStudent && (
                <>
                  <Link
                    to="/student/discover"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                  >
                    <Compass className="w-4 h-4 text-teal-400" />
                    <span>Discover Opportunities</span>
                  </Link>

                  <Link
                    to="/student/intelligence"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                  >
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>Career Intelligence & What-If</span>
                  </Link>

                  <Link
                    to="/student/gaps"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                  >
                    <TrendingUp className="w-4 h-4 text-teal-400" />
                    <span>Gap Roadmap</span>
                  </Link>

                  <Link
                    to="/student/opportunities"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                  >
                    <Briefcase className="w-4 h-4 text-teal-400" />
                    <span>Opportunities</span>
                  </Link>

                  <Link
                    to="/student/connections"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                  >
                    <Users className="w-4 h-4 text-teal-400" />
                    <span>Connections</span>
                  </Link>

                  <Link
                    to="/evidence"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                  >
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span>Evidence</span>
                  </Link>

                  <Link
                    to="/career-goals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                  >
                    <Target className="w-4 h-4 text-teal-400" />
                    <span>Career Goals</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                  >
                    <User className="w-4 h-4 text-teal-400" />
                    <span>Profile</span>
                  </Link>
                </>
              )}
              {(isRecruiter || isAdmin) && (
                <>
                  <Link
                    to="/recruiter/opportunities"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                  >
                    <Briefcase className="w-4 h-4 text-teal-400" />
                    <span>Opportunities</span>
                  </Link>

                  <Link
                    to="/recruiter/connections"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                  >
                    <Users className="w-4 h-4 text-teal-400" />
                    <span>Connections</span>
                  </Link>

                  <Link
                    to="/recruiter/verifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                  >
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span>Verification Queue</span>
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-slate-800 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-sm text-slate-200 bg-slate-800 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 text-sm text-white bg-teal-600 rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
