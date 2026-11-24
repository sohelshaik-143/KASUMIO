import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Building,
  ChevronDown
} from 'lucide-react';

export const KasumoHeader = ({ onToggleMobile }) => {
  const { user, isStudent, isRecruiter } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState('');

  const handleGlobalSearchSubmit = (e) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    if (isStudent) {
      navigate(`/student/discover?query=${encodeURIComponent(globalSearch.trim())}`);
    } else {
      navigate(`/recruiter/candidates?query=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  const orgName = user?.organizationName || 'Acme Engineering';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-[68px] px-6 lg:px-8 bg-[#edf2f9]/90 dark:bg-[#090f1e]/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/60 transition-colors">
      {/* Mobile Toggle Button */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={onToggleMobile}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center/Left Search Pill */}
      <form onSubmit={handleGlobalSearchSubmit} className="flex-1 max-w-2xl mr-4">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 pointer-events-none" />
          <input
            type="search"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder={isRecruiter ? "Search candidates by skills, technologies or projects... (Ctrl + K)" : "Search opportunities, skills, or technologies... (Ctrl + K)"}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#0e172a] border border-slate-200/90 dark:border-slate-800 rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition"
          />
        </div>
      </form>

      {/* Right Controls: Notifications, Theme Switch & Profile badge */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notification Bell with Badge */}
        <button
          type="button"
          className="relative p-2.5 bg-white dark:bg-[#0e172a] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-full border border-slate-200/90 dark:border-slate-800 shadow-2xs transition"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-xs">
            {isRecruiter ? '5' : '3'}
          </span>
        </button>

        {/* Theme Toggle Pill Switch */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-full border border-slate-300/60 dark:border-slate-700 transition hover:bg-slate-200 dark:hover:bg-slate-700/80"
          aria-label="Toggle light/dark theme"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <div className={`p-1 rounded-full transition ${!isDark ? 'bg-white shadow-2xs text-amber-500' : 'text-slate-400 dark:text-slate-500'}`}>
            <Sun className="w-3.5 h-3.5" />
          </div>
          <div className={`p-1 rounded-full transition ${isDark ? 'bg-[#0f172a] shadow-2xs text-blue-400' : 'text-slate-400'}`}>
            <Moon className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Recruiter Organization Pill (As shown in top right of reference image) */}
        {isRecruiter && (
          <button
            type="button"
            onClick={() => navigate('/recruiter/organization')}
            className="hidden sm:flex items-center gap-2 pl-1.5 pr-3 py-1 bg-white dark:bg-[#0e172a] border border-slate-200/90 dark:border-slate-800 rounded-full shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
              {orgName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
              {orgName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </button>
        )}
      </div>
    </header>
  );
};
