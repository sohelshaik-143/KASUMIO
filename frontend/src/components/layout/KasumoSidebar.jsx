import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Compass,
  Briefcase,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Building,
  GraduationCap,
  Code
} from 'lucide-react';

export const KasumoSidebar = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { user, logout, isStudent, isRecruiter, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Student nav: ~5 items as specified in Step 5
  const studentNavItems = [
    { name: 'Dashboard', path: '/', icon: Layers },
    { name: 'Evidence Portfolio', path: '/evidence', icon: ShieldCheck },
    { name: 'Roles & Gaps', path: '/student/discover', icon: Compass },
    { name: 'Technical Assessments', path: '/student/assessments', icon: Code },
    { name: 'Connections', path: '/student/connections', icon: Users },
  ];

  // Recruiter nav: ~5 items as specified in Step 5
  const recruiterNavItems = [
    { name: 'Dashboard', path: '/', icon: Layers },
    { name: 'Opportunities', path: '/recruiter/opportunities', icon: Briefcase },
    { name: 'Candidates & Connections', path: '/recruiter/connections', icon: Users },
    { name: 'Verification Queue', path: '/recruiter/verifications', icon: ShieldCheck },
  ];

  const navItems = isStudent ? studentNavItems : (isRecruiter || isAdmin) ? recruiterNavItems : [];

  const navItemContent = (item) => {
    const active = isActive(item.path);
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={() => setMobileOpen(false)}
        title={collapsed ? item.name : undefined}
        className={`group relative flex items-center gap-3 px-3 min-h-[44px] rounded-lg text-xs font-medium transition duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified ${
          active
            ? 'bg-verified-light text-verified font-semibold border border-verified-border'
            : 'text-ink-muted hover:text-ink hover:bg-paper-subtle'
        }`}
      >
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-verified rounded-r-full" />
        )}
        
        <Icon className={`w-4 h-4 shrink-0 transition ${active ? 'text-verified' : 'text-ink-subtle group-hover:text-ink'}`} aria-hidden="true" />

        {!collapsed && (
          <span className="truncate">{item.name}</span>
        )}
      </NavLink>
    );
  };

  const sidebarBody = (
    <div className="flex flex-col h-full bg-white border-r border-paper-border select-none">
      {/* Brand Header */}
      <div className={`flex items-center justify-between h-16 px-4 border-b border-paper-border shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-verified flex items-center justify-center text-white font-bold text-base tracking-wider shrink-0 shadow-xs">
            K
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm text-ink tracking-tight font-serif">KASUMIO</span>
              <span className="text-xs text-ink-subtle truncate">
                Proof, Not Profile
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar navigation"
          className="md:hidden p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-paper-subtle transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav aria-label="Sidebar Navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {!collapsed && (
          <div className="px-3 text-xs font-bold text-ink-subtle uppercase tracking-wider mb-2">
            Navigation
          </div>
        )}
        <div className="space-y-1">
          {navItems.map((item) => navItemContent(item))}
        </div>
      </nav>

      {/* User Footer Profile & Collapse Toggle */}
      <div className="p-3 border-t border-paper-border bg-paper-subtle shrink-0 space-y-2">
        {user && (
          <div className={`flex items-center gap-2.5 p-2 rounded-lg bg-white border border-paper-border shadow-xs ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-verified-light border border-verified-border text-verified flex items-center justify-center font-bold text-xs shrink-0">
              {isStudent ? <GraduationCap className="w-4 h-4" aria-hidden="true" /> : <Building className="w-4 h-4" aria-hidden="true" />}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-ink truncate">
                  {user.fullName || user.email.split('@')[0]}
                </p>
                <p className="text-xs text-verified font-medium truncate">
                  {user.role} {user.organizationName ? `• ${user.organizationName}` : ''}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                className="p-1.5 text-ink-muted hover:text-gap hover:bg-paper-subtle rounded-md transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gap"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Desktop Collapse / Expand Toggle */}
        <div className="hidden md:flex items-center justify-end">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full min-h-[36px] flex items-center justify-center gap-2 py-1.5 px-2 rounded-md text-ink-muted hover:text-ink hover:bg-white text-xs transition font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                <span className="text-xs text-ink-muted">Collapse navigation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside
        aria-label="Main Navigation"
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-200 ease-in-out ${
          collapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarBody}
      </aside>

      {/* Mobile Drawer Backdrop & Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-xl z-10">
            {sidebarBody}
          </div>
        </div>
      )}
    </>
  );
};

export default KasumoSidebar;
