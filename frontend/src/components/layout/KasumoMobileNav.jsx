import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Compass,
  Briefcase,
  Users,
  ShieldCheck,
  Code
} from 'lucide-react';

export const KasumoMobileNav = () => {
  const { user, isStudent, isRecruiter, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const studentItems = [
    { name: 'Dashboard', path: '/', icon: Layers },
    { name: 'Evidence', path: '/evidence', icon: ShieldCheck },
    { name: 'Roles', path: '/student/discover', icon: Compass },
    { name: 'Assessments', path: '/student/assessments', icon: Code },
    { name: 'Connections', path: '/student/connections', icon: Users },
  ];

  const recruiterItems = [
    { name: 'Dashboard', path: '/', icon: Layers },
    { name: 'Opportunities', path: '/recruiter/opportunities', icon: Briefcase },
    { name: 'Candidates', path: '/recruiter/connections', icon: Users },
    { name: 'Verification', path: '/recruiter/verifications', icon: ShieldCheck },
  ];

  const navItems = isStudent ? studentItems : (isRecruiter || isAdmin) ? recruiterItems : [];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-paper-border px-1 py-1 shadow-md"
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
                  : 'text-ink-muted hover:text-ink'
              } focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified`}
            >
              <div className={`p-1 rounded-md ${active ? 'bg-verified-light text-verified' : ''}`}>
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
