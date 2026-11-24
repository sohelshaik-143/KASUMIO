import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Compass,
  Briefcase,
  Users,
  ShieldCheck,
  Code,
  PlusSquare,
  MessageSquare,
  Settings
} from 'lucide-react';

export const KasumoMobileNav = () => {
  const { user, isStudent, isRecruiter, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const roleUpper = (user?.role || '').toUpperCase();
  const isRecruiterRole = isRecruiter || roleUpper === 'RECRUITER' || roleUpper === 'ROLE_RECRUITER';
  const isAdminRole = isAdmin || roleUpper === 'ADMIN' || roleUpper === 'ROLE_ADMIN';
  const isStudentRole = isStudent || roleUpper === 'STUDENT' || roleUpper === 'ROLE_STUDENT';

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const studentItems = [
    { name: 'Dashboard', path: '/', icon: Layers },
    { name: 'Evidence', path: '/evidence', icon: ShieldCheck },
    { name: 'Roles', path: '/student/discover', icon: Compass },
    { name: 'Messages', path: '/student/messages', icon: MessageSquare },
    { name: 'Assessments', path: '/student/assessments', icon: Code },
    { name: 'Connections', path: '/student/connections', icon: Users },
  ];

  const recruiterItems = [
    { name: 'Dashboard', path: '/', icon: Layers },
    { name: 'Post Role', path: '/recruiter/opportunities/new', icon: PlusSquare },
    { name: 'Candidates', path: '/recruiter/candidates', icon: Users },
    { name: 'Messages', path: '/recruiter/messages', icon: MessageSquare },
    { name: 'Settings', path: '/recruiter/settings', icon: Settings },
  ];

  const navItems = isStudentRole ? studentItems : (isRecruiterRole || isAdminRole) ? recruiterItems : [];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#090f1e] border-t border-paper-border dark:border-slate-800 px-1 py-1 shadow-md transition-colors"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-lg text-xs font-medium transition ${
                active
                  ? 'text-verified font-bold'
                  : 'text-ink-muted dark:text-slate-400 hover:text-ink dark:hover:text-white'
              } focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified`}
            >
              <div className={`p-1 rounded-md ${active ? 'bg-verified-light dark:bg-emerald-950/40 text-verified' : ''}`}>
                <Icon className="w-4 h-4" aria-hidden="true" />
              </div>
              <span className="truncate max-w-[64px]">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default KasumoMobileNav;
