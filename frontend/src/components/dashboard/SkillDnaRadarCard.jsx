import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight } from 'lucide-react';

export const SkillDnaRadarCard = ({ evidence = [], skills = [] }) => {
  const hasEvidence = evidence.length > 0;

  // 5 standard core skills matching reference
  const baseSkills = [
    { name: 'Java', color: '#8B5CF6' },
    { name: 'DSA', color: '#3B82F6' },
    { name: 'System Design', color: '#10B981' },
    { name: 'Database', color: '#F59E0B' },
    { name: 'Backend Development', color: '#2563EB' },
  ];

  // Dynamically compute scores from user's actual uploaded evidence
  const skillsList = baseSkills.map((base) => {
    if (!hasEvidence) {
      return { ...base, score: 0 };
    }

    // Find evidence matching this skill
    const matching = evidence.filter((e) => {
      const sName = (e.skillName || '').toLowerCase();
      const title = (e.title || '').toLowerCase();
      const bName = base.name.toLowerCase();
      return sName.includes(bName) || title.includes(bName) || (bName === 'database' && (sName.includes('sql') || title.includes('sql')));
    });

    if (matching.length === 0) {
      // If user has other uploaded evidence, assign modest baseline proportional to total evidence
      return { ...base, score: Math.min(35, evidence.length * 10) };
    }

    const verifiedCount = matching.filter((e) => e.verified).length;
    const totalCount = matching.length;
    const calculatedScore = Math.min(100, 40 + verifiedCount * 30 + totalCount * 20);
    return { ...base, score: calculatedScore };
  });

  // Calculate polygon points dynamically:
  // Center is (100, 100), max radius is 70
  // Angles: Java (-90°), DSA (-18°), System Design (54°), Database (126°), Backend (198°)
  const polygonPoints = skillsList
    .map((skill, i) => {
      const angleDeg = -90 + i * 72;
      const angleRad = (angleDeg * Math.PI) / 180;
      const radius = (skill.score / 100) * 70;
      const x = (100 + radius * Math.cos(angleRad)).toFixed(1);
      const y = (100 + radius * Math.sin(angleRad)).toFixed(1);
      return `${x},${y}`;
    })
    .join(' ');

  const vertices = skillsList.map((skill, i) => {
    const angleDeg = -90 + i * 72;
    const angleRad = (angleDeg * Math.PI) / 180;
    const radius = (skill.score / 100) * 70;
    return {
      cx: (100 + radius * Math.cos(angleRad)).toFixed(1),
      cy: (100 + radius * Math.sin(angleRad)).toFixed(1),
      score: skill.score,
    };
  });

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
          to="/evidence"
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

            {/* Plotted Skill Data Polygon */}
            {hasEvidence ? (
              <>
                <polygon
                  points={polygonPoints}
                  fill="#8B5CF6"
                  fillOpacity="0.2"
                  stroke="#6366F1"
                  strokeWidth="2"
                  className="transition-all duration-700"
                />
                {vertices.map((v, i) => (
                  <circle key={i} cx={v.cx} cy={v.cy} r="3" fill="#6366F1" />
                ))}
              </>
            ) : (
              <circle cx="100" cy="100" r="3.5" fill="#94A3B8" />
            )}

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

export default SkillDnaRadarCard;
