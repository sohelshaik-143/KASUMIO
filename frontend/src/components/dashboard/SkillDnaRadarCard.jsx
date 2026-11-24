import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight } from 'lucide-react';

export const SkillDnaRadarCard = () => {
  const skillsList = [
    { name: 'Java', score: 92, color: '#8B5CF6' },
    { name: 'DSA', score: 88, color: '#3B82F6' },
    { name: 'System Design', score: 81, color: '#10B981' },
    { name: 'Database', score: 75, color: '#F59E0B' },
    { name: 'Backend Development', score: 90, color: '#2563EB' },
  ];

  // 5 Radar Vertices calculation around center (100, 100) with radius 70:
  // Angles:
  // 0: Java (top: -90 deg -> 100, 30)
  // 1: DSA (top-right: -18 deg -> 166.5, 78.4)
  // 2: System Design (bottom-right: 54 deg -> 141.1, 156.6)
  // 3: Database (bottom-left: 126 deg -> 58.9, 156.6)
  // 4: Backend (top-left: 198 deg -> 33.5, 78.4)

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Your Skill DNA
          </h3>
        </div>

        <Link
          to="/student/intelligence"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Content: Left Radar Chart + Right Skills List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-3">
        {/* Left Radar / Spider Chart */}
        <div className="md:col-span-6 relative flex items-center justify-center py-2">
          <svg viewBox="0 0 200 200" className="w-full max-w-[190px] h-auto overflow-visible">
            {/* Concentric Pentagons */}
            <polygon points="100,30 166.5,78.4 141.1,156.6 58.9,156.6 33.5,78.4" fill="none" stroke="#E2E8F0" strokeWidth="1" />
            <polygon points="100,53.3 144.3,85.6 127.4,137.7 72.6,137.7 55.7,85.6" fill="none" stroke="#E2E8F0" strokeWidth="1" />
            <polygon points="100,76.6 122.2,92.8 113.7,118.8 86.3,118.8 77.8,92.8" fill="none" stroke="#E2E8F0" strokeWidth="1" />

            {/* Axis Lines from Center (100, 100) */}
            <line x1="100" y1="100" x2="100" y2="30" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="100" y1="100" x2="166.5" y2="78.4" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="100" y1="100" x2="141.1" y2="156.6" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="100" y1="100" x2="58.9" y2="156.6" stroke="#E2E8F0" strokeWidth="1" />
            <line x1="100" y1="100" x2="33.5" y2="78.4" stroke="#E2E8F0" strokeWidth="1" />

            {/* Plotted Skill Data Polygon: Java: 92%, DSA: 88%, System Design: 81%, Database: 75%, Backend: 90% */}
            <polygon
              points="100,35.6 158.5,81.0 133.3,145.8 69.2,142.4 40.2,80.5"
              fill="#8B5CF6"
              fillOpacity="0.2"
              stroke="#6366F1"
              strokeWidth="2"
            />

            {/* Vertices Dots */}
            <circle cx="100" cy="35.6" r="3" fill="#6366F1" />
            <circle cx="158.5" cy="81.0" r="3" fill="#6366F1" />
            <circle cx="133.3" cy="145.8" r="3" fill="#6366F1" />
            <circle cx="69.2" cy="142.4" r="3" fill="#6366F1" />
            <circle cx="40.2" cy="80.5" r="3" fill="#6366F1" />

            {/* Outer Labels */}
            <text x="100" y="20" textAnchor="middle" className="text-[10px] font-bold fill-slate-700">Java</text>
            <text x="175" y="82" textAnchor="start" className="text-[10px] font-bold fill-slate-700">DSA</text>
            <text x="150" y="172" textAnchor="middle" className="text-[10px] font-bold fill-slate-700">System Design</text>
            <text x="50" y="172" textAnchor="middle" className="text-[10px] font-bold fill-slate-700">Database</text>
            <text x="24" y="82" textAnchor="end" className="text-[10px] font-bold fill-slate-700">Backend</text>
          </svg>
        </div>

        {/* Right Skills Progress List */}
        <div className="md:col-span-6 space-y-2.5">
          {skillsList.map((skill) => (
            <div key={skill.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: skill.color }} />
                  <span className="truncate">{skill.name}</span>
                </span>
                <span className="font-extrabold text-slate-900 font-sans">
                  {skill.score}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${skill.score}%`, backgroundColor: skill.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
