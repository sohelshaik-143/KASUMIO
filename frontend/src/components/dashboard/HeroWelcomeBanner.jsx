import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const HeroWelcomeBanner = ({ user }) => {
  const navigate = useNavigate();
  const firstName = user?.fullName?.split(' ')[0] || 'Sohel';

  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-[#0a1224] via-[#0f1d3d] to-[#142650] border border-blue-900/30 p-6 sm:p-7 text-white shadow-sm overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 min-h-[170px]">
      {/* Background Neural / Constellation Mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="meshGlow" cx="60%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0B132B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#meshGlow)" />
          {/* Constellation nodes & links */}
          <line x1="150" y1="40" x2="220" y2="90" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="220" y1="90" x2="310" y2="60" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="310" y1="60" x2="420" y2="120" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="3 3" />
          <circle cx="150" cy="40" r="3" fill="#38BDF8" />
          <circle cx="220" cy="90" r="2.5" fill="#60A5FA" />
          <circle cx="310" cy="60" r="3.5" fill="#38BDF8" />
          <circle cx="420" cy="120" r="2.5" fill="#60A5FA" />
        </svg>
      </div>

      {/* Left Text Content */}
      <div className="relative z-10 max-w-lg space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>Good Morning,</span>
          <span className="text-[#38bdf8]">{firstName}!</span>
          <span className="text-2xl">👋</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-normal">
          Keep building your skills. Your future is here.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate('/student/discover')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 hover:border-white text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition shadow-xs backdrop-blur-xs"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right Graphic: Skills + Evidence = Opportunity 📈 */}
      <div className="relative z-10 flex items-center gap-3 shrink-0 sm:pr-4">
        <div className="text-right">
          <span className="text-sm font-bold text-white tracking-tight block">
            Skills + Evidence =<br />Opportunity
          </span>
        </div>

        {/* Glowing Upward Trending Chart & Arrow Icon */}
        <div className="relative w-24 h-20 flex items-center justify-center">
          <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
            <rect x="15" y="55" width="10" height="25" rx="2" fill="#1E3A8A" opacity="0.6" />
            <rect x="32" y="42" width="10" height="38" rx="2" fill="#2563EB" opacity="0.7" />
            <rect x="49" y="30" width="10" height="50" rx="2" fill="#3B82F6" opacity="0.8" />
            <rect x="66" y="16" width="10" height="64" rx="2" fill="#60A5FA" opacity="0.9" />
            <path
              d="M10 65 Q 40 45, 80 15"
              fill="none"
              stroke="#FBBF24"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <polygon points="80,10 88,18 76,21" fill="#FBBF24" />
          </svg>
        </div>
      </div>
    </div>
  );
};
