import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  ChevronRight,
  User,
  LogOut,
  ShieldCheck,
  Building,
  GraduationCap,
  Search,
  Layers
} from 'lucide-react';

export const KasumoHeader = ({ onToggleMobile }) => {
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumbs = () => {
    const p = location.pathname;
    if (p === '/') return [{ label: 'Platform', path: '/' }, { label: 'Dashboard' }];
    if (p.startsWith('/student/discover/')) return [{ label: 'Opportunities', path: '/student/discover' }, { label: 'Role Detail' }];
    if (p === '/student/discover') return [{ label: 'Roles & Gaps', path: '/student/discover' }, { label: 'Explore Roles' }];
    if (p === '/student/assessments') return [{ label: 'Assessments', path: '/student/assessments' }, { label: 'Screening Tests' }];
    if (p === '/student/connections') return [{ label: 'Network', path: '/student/connections' }, { label: 'Connections' }];
    if (p === '/evidence') return [{ label: 'Portfolio', path: '/evidence' }, { label: 'Verifiable Evidence' }];
    if (p === '/career-goals') return [{ label: 'Career', path: '/career-goals' }, { label: 'Career Goals' }];
    if (p === '/profile') return [{ label: 'Account', path: '/profile' }, { label: 'Profile' }];

    if (p === '/recruiter/opportunities') return [{ label: 'Opportunities', path: '/recruiter/opportunities' }, { label: 'Active Opportunities' }];
    if (p === '/recruiter/opportunities/new') return [{ label: 'Opportunities', path: '/recruiter/opportunities' }, { label: 'Create Opportunity' }];
    if (p.startsWith('/recruiter/opportunities/')) return [{ label: 'Opportunities', path: '/recruiter/opportunities' }, { label: 'Opportunity Audit' }];
    if (p === '/recruiter/connections') return [{ label: 'Recruitment', path: '/recruiter/connections' }, { label: 'Candidate Connections' }];
    if (p === '/recruiter/verifications' || p === '/verifications') return [{ label: 'Audit', path: '/recruiter/verifications' }, { label: 'Verification Queue' }];

    return [{ label: 'KASUMIO', path: '/' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-white border-b border-paper-border sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobile}
          className="md:hidden p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-paper-subtle focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-ink-muted" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-ink-subtle shrink-0" aria-hidden="true" />}
                {isLast || !crumb.path ? (
                  <span className="font-semibold text-ink truncate max-w-[150px] sm:max-w-xs">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="hover:text-ink transition-colors truncate max-w-[120px]"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <form onSubmit={handleGlobalSearchSubmit} className="w-full relative">
          <label htmlFor="global-search-input" className="sr-only">Search roles, skills, or organizations</label>
          <Search className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            id="global-search-input"
            type="search"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search roles, skills, organizations..."
            className="w-full pl-9 pr-4 py-1.5 bg-paper-subtle border border-paper-border focus:border-verified focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-verified rounded-lg text-xs text-ink placeholder-ink-subtle transition"
          />
        </form>
      </div>

      {/* Right: User Profile Dropdown */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              aria-expanded={profileDropdownOpen}
              aria-label="User account menu"
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-paper-subtle hover:bg-paper-border border border-paper-border text-ink transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified"
            >
              <div className="w-7 h-7 rounded-md bg-verified-light border border-verified-border text-verified flex items-center justify-center font-bold text-xs shrink-0">
                {isStudent ? <GraduationCap className="w-4 h-4" aria-hidden="true" /> : <Building className="w-4 h-4" aria-hidden="true" />}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-ink leading-tight">
                  {user.fullName || user.email.split('@')[0]}
                </span>
                <span className="text-xs text-verified font-mono font-medium leading-tight">
                  {user.role}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-paper-border rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in-50 duration-100">
                <div className="px-3.5 py-2.5 border-b border-paper-border text-xs">
                  <p className="font-semibold text-ink truncate">{user.fullName || user.email}</p>
                  <p className="text-xs text-ink-muted truncate font-mono">{user.email}</p>
                  {user.organizationName && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-verified-light text-verified font-medium border border-verified-border">
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
                        className="flex items-center gap-2 px-3.5 py-2 text-xs text-ink-muted hover:bg-paper-subtle hover:text-ink transition"
                      >
                        <User className="w-4 h-4 text-verified" aria-hidden="true" />
                        <span>Student Profile</span>
                      </Link>
                      <Link
                        to="/evidence"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs text-ink-muted hover:bg-paper-subtle hover:text-ink transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-verified" aria-hidden="true" />
                        <span>Evidence Portfolio</span>
                      </Link>
                    </>
                  )}

                  {(isRecruiter || isAdmin) && (
                    <Link
                      to="/recruiter/opportunities"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-ink-muted hover:bg-paper-subtle hover:text-ink transition"
                    >
                      <Layers className="w-4 h-4 text-verified" aria-hidden="true" />
                      <span>Opportunity Hub</span>
                    </Link>
                  )}
                </div>

                <div className="pt-1 border-t border-paper-border">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-gap hover:bg-gap-light transition text-left font-medium"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
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
              className="px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-verified hover:bg-verified-hover rounded-lg transition shadow-xs"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default KasumoHeader;
