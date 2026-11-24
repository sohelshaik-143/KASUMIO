import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon
} from 'lucide-react';

export const KasumoHeader = ({ onToggleMobile }) => {
  const { isStudent } = useAuth();
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleGlobalSearchSubmit = (e) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    if (isStudent) {
      navigate(`/student/discover?query=${encodeURIComponent(globalSearch.trim())}`);
    } else {
      navigate(`/recruiter/opportunities?query=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-[68px] px-6 lg:px-8 bg-[#edf2f9]/90 backdrop-blur-md">
      {/* Mobile Toggle Button */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={onToggleMobile}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center/Left Search Pill */}
      <form onSubmit={handleGlobalSearchSubmit} className="flex-1 max-w-2xl mr-4">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="search"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search opportunities, skills, or technologies... (Ctrl + K)"
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-2xs hover:border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </form>

      {/* Right Controls: Notifications & Theme Switch */}
      <div className="flex items-center gap-3.5 shrink-0">
        {/* Notification Bell with Badge 3 */}
        <button
          type="button"
          className="relative p-2.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-full border border-slate-200/90 shadow-2xs transition"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-xs">
            3
          </span>
        </button>

        {/* Theme Toggle Pill Switch */}
        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-full border border-slate-300/60 transition hover:bg-slate-200"
          aria-label="Toggle theme mode"
        >
          <div className={`p-1 rounded-full transition ${!isDarkMode ? 'bg-white shadow-2xs text-amber-500' : 'text-slate-400'}`}>
            <Sun className="w-3.5 h-3.5" />
          </div>
          <div className={`p-1 rounded-full transition ${isDarkMode ? 'bg-[#0f172a] shadow-2xs text-blue-400' : 'text-slate-400'}`}>
            <Moon className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    </header>
  );
};
