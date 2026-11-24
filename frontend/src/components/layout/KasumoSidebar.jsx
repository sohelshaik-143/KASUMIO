import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Dna,
  FolderGit2,
  CheckSquare,
  Briefcase,
  Users2,
  User,
  Settings,
  ChevronDown,
  LogOut,
  ArrowRight,
  PlusSquare,
  Search,
  Users,
  MessageSquare,
  BarChart3,
  Building2,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

export const KasumoSidebar = ({
  collapsed = false,
  setCollapsed,
  mobileOpen = false,
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

  // Student Navigation Items - Strictly Preserved
  const studentNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Skill DNA', path: '/student/intelligence', icon: Dna },
    { name: 'My Projects', path: '/evidence', icon: FolderGit2 },
    { name: 'Assessments', path: '/student/assessments', icon: CheckSquare },
    { name: 'Opportunities', path: '/student/discover', icon: Briefcase },
    { name: 'Connections', path: '/student/connections', icon: Users2 },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/student/settings', icon: Settings },
  ];

  // Recruiter Navigation Items - Matching Approved Reference Image
  const recruiterNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Post Opportunity', path: '/recruiter/opportunities/new', icon: PlusSquare },
    { name: 'Find Candidates', path: '/recruiter/candidates', icon: Search },
    { name: 'Talent Search', path: '/recruiter/talent-search', icon: Users },
    { name: 'Shortlist', path: '/recruiter/shortlist', icon: CheckSquare },
    { name: 'Applications', path: '/recruiter/applications', icon: Briefcase },
    { name: 'Messages', path: '/recruiter/messages', icon: MessageSquare },
    { name: 'Assessments', path: '/recruiter/assessments', icon: CheckSquare },
    { name: 'Analytics', path: '/recruiter/analytics', icon: BarChart3 },
    { name: 'My Organisation', path: '/recruiter/organization', icon: Building2 },
    { name: 'Settings', path: '/recruiter/settings', icon: Settings },
    { name: 'Help & Support', path: '/recruiter/help', icon: HelpCircle },
  ];

  const navItems = (isRecruiter || isAdmin) ? recruiterNavItems : studentNavItems;

  const displayName = user?.fullName || (isStudent ? 'Shaik Sohel' : 'Arjun Reddy');
  const displayRole = isStudent ? 'Student • E3 • EEE' : (user?.organizationName ? `${user.organizationName} • Recruiter` : 'Tech Recruiter');
  const avatarUrl = user?.avatarUrl;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-[252px] bg-[#090f1e] border-r border-[#152037] text-white transition-transform duration-200 select-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-5 shrink-0">
          {/* Folded Origami K Logo */}
          <div className="shrink-0 cursor-pointer" onClick={() => navigate('/')}>
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="4" width="8" height="28" rx="2" fill="#2563EB" />
              <path d="M13 18L26 5C26.8 4.2 28.2 4.6 28.5 5.7L29 7.5C29.4 8.6 29 9.8 28.1 10.6L19 19L28.5 28.5C29.4 29.4 29.2 31 28 31.8L26 33C25.2 33.5 24.2 33.3 23.6 32.6L13 20" fill="#38BDF8" />
              <path d="M13 15L23 5.5C23.8 4.7 25.1 4.9 25.5 6L26 7.5C26.4 8.6 26 9.8 25.1 10.6L17.5 18L13 15Z" fill="#60A5FA" />
            </svg>
          </div>
          <div className="flex flex-col cursor-pointer" onClick={() => navigate('/')}>
            <span className="font-extrabold text-base tracking-wider text-white font-sans">
              KASUMO
            </span>
            <span className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
              Truth-First Talent Intelligence
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3.5 py-1.5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-[#2563eb] text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center leading-none shrink-0 shadow-xs">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Banner Card */}
        {isRecruiter || isAdmin ? (
          /* Recruiter "Hire with Confidence" Card matching Reference Image */
          <div className="px-3.5 mb-3 shrink-0">
            <div className="relative rounded-2xl p-4 bg-gradient-to-b from-[#132347] via-[#0d1831] to-[#0a1122] border border-blue-500/20 overflow-hidden shadow-lg flex items-center justify-between gap-3">
              <div className="space-y-1 z-10">
                <h4 className="text-[13px] font-bold text-white tracking-tight leading-tight">
                  Hire with<br />Confidence
                </h4>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Backed by real skills and verified evidence.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/recruiter/candidates')}
                  className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[11px] font-bold rounded-full transition shadow-xs"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>
        ) : (
          /* Student "Prove. Grow. Get Hired." Card - Strictly Preserved */
          <div className="px-3.5 mb-3 shrink-0">
            <div className="relative rounded-2xl p-4 bg-gradient-to-b from-[#132347] via-[#0d1831] to-[#0a1122] border border-blue-500/20 overflow-hidden shadow-lg">
              <div className="absolute right-0 bottom-0 w-28 h-24 pointer-events-none opacity-80">
                <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 80L75 25L95 80H40Z" fill="url(#mountGrad)" />
                  <path d="M10 80L50 40L75 80H10Z" fill="url(#mountDark)" />
                  <line x1="75" y1="25" x2="75" y2="15" stroke="#FFFFFF" strokeWidth="1.5" />
                  <polygon points="75,15 85,18 75,21" fill="#60A5FA" />
                  <circle cx="20" cy="20" r="1" fill="#FFFFFF" opacity="0.6" />
                  <circle cx="85" cy="10" r="1.5" fill="#60A5FA" opacity="0.8" />
                  <circle cx="60" cy="15" r="1" fill="#FFFFFF" opacity="0.7" />
                  <defs>
                    <linearGradient id="mountGrad" x1="75" y1="25" x2="75" y2="80" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#2563EB" />
                      <stop offset="1" stopColor="#0B132B" />
                    </linearGradient>
                    <linearGradient id="mountDark" x1="50" y1="40" x2="50" y2="80" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#1E3A8A" />
                      <stop offset="1" stopColor="#0A0F1D" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="relative z-10 space-y-1">
                <h4 className="text-[13px] font-bold text-white tracking-tight leading-tight">
                  Prove. Grow.<br />Get Hired.
                </h4>
                <p className="text-[11px] text-slate-300 leading-snug">
                  With KASUMO, your skills speak louder.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/evidence')}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[11px] font-bold rounded-full transition shadow-xs"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Profile Footer */}
        <div className="px-3.5 py-3 border-t border-[#152037] bg-[#070c18] shrink-0">
          <div className="flex items-center justify-between gap-2.5">
            <div
              className="flex items-center gap-2.5 min-w-0 cursor-pointer"
              onClick={() => navigate((isRecruiter || isAdmin) ? '/recruiter/settings' : '/profile')}
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden border border-white/20">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                  )}
                </div>
                {/* Active green status dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#090f1e]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate leading-tight">
                  {displayName}
                </span>
                <span className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                  {displayRole}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
