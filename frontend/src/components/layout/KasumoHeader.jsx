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
  ChevronDown,
  X,
  CheckCircle2
} from 'lucide-react';

export const KasumoHeader = ({ onToggleMobile }) => {
  const { user, isStudent, isRecruiter } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Dynamic notifications state
  const [notifications, setNotifications] = useState(() => {
    if (isRecruiter) {
      return [
        {
          id: 1,
          title: 'New candidate match surfaced',
          desc: 'A student profile with verified Spring Boot evidence matched your criteria.',
          time: '10m ago',
          unread: true
        },
        {
          id: 2,
          title: 'Technical assessment completed',
          desc: 'Alex Rivera scored 95% on algorithmic test suite.',
          time: '1h ago',
          unread: true
        },
        {
          id: 3,
          title: 'Organization profile active',
          desc: 'Acme Engineering attestation status is verified.',
          time: '1d ago',
          unread: false
        }
      ];
    } else {
      return [
        {
          id: 1,
          title: 'Employer connection request',
          desc: 'A tech recruiter viewed your project footprint and requested connection.',
          time: '20m ago',
          unread: true
        },
        {
          id: 2,
          title: 'Assessment blueprint available',
          desc: 'New screening assessment challenge is ready in your portal.',
          time: '2h ago',
          unread: true
        },
        {
          id: 3,
          title: 'Evidence verified by organization',
          desc: 'Your Git repository proof received institutional verification.',
          time: '1d ago',
          unread: false
        }
      ];
    }
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleDismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

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
        {/* Notification Bell with Badge & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="relative z-50 p-2.5 bg-white dark:bg-[#0e172a] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-full border border-slate-200/90 dark:border-slate-800 shadow-2xs transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-xs pointer-events-none">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 overflow-hidden animate-in fade-in-50 duration-150">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 flex items-start justify-between gap-3 transition ${
                          item.unread
                            ? 'bg-blue-50/40 dark:bg-blue-950/20'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-850/40'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            {item.unread && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                            )}
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                              {item.title}
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                            {item.desc}
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium block pt-0.5">
                            {item.time}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDismiss(item.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

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
