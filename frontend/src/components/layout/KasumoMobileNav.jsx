import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Compass,
  Sparkles,
  TrendingUp,
  User,
  Briefcase,
  Users,
  ShieldCheck
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
    { name: 'Home', path: '/', icon: Layers },
    { name: 'Opportunities', path: '/student/discover', icon: Compass },
    { name: 'Capability', path: '/student/intelligence', icon: Sparkles },
    { name: 'Learn', path: '/student/gaps', icon: TrendingUp },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const recruiterItems = [
    { name: 'Home', path: '/', icon: Layers },
    { name: 'Opportunities', path: '/recruiter/opportunities', icon: Briefcase },
    { name: 'Connections', path: '/recruiter/connections', icon: Users },
    { name: 'Audit Queue', path: '/recruiter/verifications', icon: ShieldCheck },
  ];

  const navItems = isStudent ? studentItems : (isRecruiter || isAdmin) ? recruiterItems : [];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-all ${
                active
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className={`p-1 rounded-md ${active ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate max-w-[64px]">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
