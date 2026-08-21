import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  ChevronRight,
  User,
  LogOut,
  Sparkles,
  ShieldCheck,
  Building,
  GraduationCap,
  Search,
  Layers
} from 'lucide-react';

export const KasumoHeader = ({ onToggleMobile, sidebarCollapsed }) => {
  const { user, logout, isStudent, isRecruiter, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGlobalSearchSubmit = (e) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    if (isStudent) {
      navigate(`/student/discover?query=${encodeURIComponent(globalSearch.trim())}`);
    } else {
      navigate(`/recruiter/opportunities?query=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumbs from location
  const getBreadcrumbs = () => {
    const p = location.pathname;
    if (p === '/') return [{ label: 'Platform', path: '/' }, { label: 'Dashboard' }];
    if (p.startsWith('/student/discover/')) return [{ label: 'Opportunities', path: '/student/discover' }, { label: 'Role Detail' }];
    if (p === '/student/discover') return [{ label: 'Talent Market', path: '/student/discover' }, { label: 'Discover Opportunities' }];
    if (p === '/student/intelligence' || p === '/student/career-intelligence') return [{ label: 'Intelligence', path: '/student/intelligence' }, { label: 'Career & What-If' }];
    if (p === '/student/gaps') return [{ label: 'Intelligence', path: '/student/intelligence' }, { label: 'Technology Gap Roadmap' }];
    if (p === '/student/opportunities') return [{ label: 'Matching', path: '/student/opportunities' }, { label: 'Matched Opportunities' }];
    if (p === '/student/connections') return [{ label: 'Network', path: '/student/connections' }, { label: 'Connection Requests' }];
    if (p === '/evidence') return [{ label: 'Portfolio', path: '/evidence' }, { label: 'Evidence & Proof' }];
    if (p === '/career-goals') return [{ label: 'Career', path: '/career-goals' }, { label: 'Career Goals' }];
    if (p === '/profile') return [{ label: 'Account', path: '/profile' }, { label: 'Student Profile' }];

    if (p === '/recruiter/opportunities') return [{ label: 'Recruitment', path: '/recruiter/opportunities' }, { label: 'Opportunities' }];
    if (p === '/recruiter/opportunities/new') return [{ label: 'Opportunities', path: '/recruiter/opportunities' }, { label: 'New Opportunity' }];
    if (p.startsWith('/recruiter/opportunities/')) return [{ label: 'Opportunities', path: '/recruiter/opportunities' }, { label: 'Matches & Review' }];
    if (p === '/recruiter/connections') return [{ label: 'Recruitment', path: '/recruiter/connections' }, { label: 'Candidate Connections' }];
    if (p === '/recruiter/verifications' || p === '/verifications') return [{ label: 'Audit', path: '/recruiter/verifications' }, { label: 'Verification Queue' }];

    return [{ label: 'KASUMIO', path: '/' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-200">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Hamburger */}
        <button
          onClick={onToggleMobile}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                {isLast || !crumb.path ? (
                  <span className="font-semibold text-slate-900 truncate max-w-[150px] sm:max-w-xs">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="hover:text-slate-900 transition-colors truncate max-w-[120px]"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <form onSubmit={handleGlobalSearchSubmit} className="w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search roles, skills, companies..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs text-slate-900 placeholder-slate-400 transition-all outline-none"
          />
        </form>
      </div>

      {/* Right: Role Status Badge & Profile Dropdown */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 transition-all focus:outline-none"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold text-xs">
                {isStudent ? <GraduationCap className="w-4 h-4" /> : <Building className="w-4 h-4" />}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 leading-tight">
                  {user.fullName || user.email.split('@')[0]}
                </span>
                <span className="text-[10px] text-indigo-600 font-mono font-medium leading-tight">
                  {user.role}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                <div className="px-3.5 py-2.5 border-b border-slate-100 text-xs">
                  <p className="font-semibold text-slate-900 truncate">{user.fullName || user.email}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  {user.organizationName && (
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                      {user.organizationName}
                    </span>
                  )}
                </div>

                <div className="py-1">
                  {isStudent && (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                      >
                        <User className="w-4 h-4 text-indigo-600" />
                        <span>Student Profile</span>
                      </Link>
                      <Link
                        to="/evidence"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>Evidence Portfolio</span>
                      </Link>
                    </>
                  )}

                  {(isRecruiter || isAdmin) && (
                    <Link
                      to="/recruiter/opportunities"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                    >
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Opportunity Hub</span>
                    </Link>
                  )}
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 transition text-left font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-xs"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
