import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Compass,
  Sparkles,
  TrendingUp,
  Briefcase,
  Users,
  ShieldCheck,
  Target,
  User,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Building,
  GraduationCap
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

  const studentNavGroups = [
    {
      label: 'Core Overview',
      items: [
        { name: 'Dashboard', path: '/', icon: Layers }
      ]
    },
    {
      label: 'Intelligence & Roles',
      items: [
        { name: 'Discover Roles', path: '/student/discover', icon: Compass },
        { name: 'Career Capability', path: '/student/intelligence', icon: Sparkles, badge: 'What-If' },
        { name: 'Growth Roadmap', path: '/student/gaps', icon: TrendingUp },
        { name: 'Matched Opportunities', path: '/student/opportunities', icon: Briefcase }
      ]
    },
    {
      label: 'Proof & Network',
      items: [
        { name: 'Evidence Portfolio', path: '/evidence', icon: ShieldCheck },
        { name: 'Connections', path: '/student/connections', icon: Users },
        { name: 'Career Goals', path: '/career-goals', icon: Target }
      ]
    },
    {
      label: 'Account',
      items: [
        { name: 'Student Profile', path: '/profile', icon: User }
      ]
    }
  ];

  const recruiterNavGroups = [
    {
      label: 'Core Overview',
      items: [
        { name: 'Dashboard', path: '/', icon: Layers }
      ]
    },
    {
      label: 'Talent & Opportunities',
      items: [
        { name: 'Opportunities', path: '/recruiter/opportunities', icon: Briefcase },
        { name: 'Create Opportunity', path: '/recruiter/opportunities/new', icon: PlusCircle },
        { name: 'Candidate Connections', path: '/recruiter/connections', icon: Users }
      ]
    },
    {
      label: 'Verification & Audit',
      items: [
        { name: 'Verification Queue', path: '/recruiter/verifications', icon: ShieldCheck }
      ]
    }
  ];

  const currentGroups = isStudent ? studentNavGroups : (isRecruiter || isAdmin) ? recruiterNavGroups : [];

  const navItemContent = (item) => {
    const active = isActive(item.path);
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={() => setMobileOpen(false)}
        title={collapsed ? item.name : undefined}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
          active
            ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/80 shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
        }`}
      >
        {/* Active bar accent */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r-full shadow-xs" />
        )}
        
        <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${active ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-800'}`} />

        {!collapsed && (
          <div className="flex-1 flex items-center justify-between overflow-hidden">
            <span className="truncate">{item.name}</span>
            {item.badge && (
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200 ml-2 shrink-0">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </NavLink>
    );
  };

  const sidebarBody = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div className={`flex items-center justify-between h-16 px-4 border-b border-slate-200 shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-black text-lg tracking-wider shadow-sm shrink-0">
            K
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 tracking-tight">KASUMIO</span>
                <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  Intel
                </span>
              </div>
              <span className="text-[10px] text-slate-500 truncate font-medium">
                Career Intelligence Platform
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {currentGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed ? (
              <h4 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {group.label}
              </h4>
            ) : (
              <div className="h-px bg-slate-200 my-2" />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => navItemContent(item))}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer Profile & Collapse Toggle */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60 shrink-0 space-y-2">
        {user && (
          <div className={`flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200 shadow-xs ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
              {isStudent ? <GraduationCap className="w-4 h-4" /> : <Building className="w-4 h-4" />}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {user.fullName || user.email.split('@')[0]}
                </p>
                <p className="text-[10px] text-indigo-600 font-medium truncate">
                  {user.role} {user.organizationName ? `• ${user.organizationName}` : ''}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Desktop Collapse / Expand Toggle */}
        <div className="hidden md:flex items-center justify-end">
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs transition font-medium"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[11px] text-slate-500">Collapse sidebar</span>
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
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarBody}
          </div>
        </div>
      )}
    </>
  );
};
