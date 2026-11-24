import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, Package, CheckCircle2, Users, Star, Target } from 'lucide-react';

export const MyProgressCard = ({
  projectsCount = 12,
  assessmentsCount = 8,
  connectionsCount = 25,
  certificatesCount = 3,
  learningGoalProgress = 70
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            My Progress
          </h3>
        </div>

        <Link
          to="/evidence"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
        >
          <span>View Analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 4 Progress Metrics Tiles */}
      <div className="grid grid-cols-4 gap-2.5 pt-3">
        {/* Projects */}
        <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-2.5 text-center space-y-1">
          <div className="w-7 h-7 mx-auto rounded-lg bg-purple-100/80 text-purple-600 flex items-center justify-center">
            <Package className="w-3.5 h-3.5" />
          </div>
          <div className="text-sm font-extrabold text-slate-900 leading-none">
            {projectsCount}
          </div>
          <div className="text-[10px] font-semibold text-slate-500 leading-none">
            Projects
          </div>
        </div>

        {/* Assessments */}
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-2.5 text-center space-y-1">
          <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-100/80 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-sm font-extrabold text-slate-900 leading-none">
            {assessmentsCount}
          </div>
          <div className="text-[10px] font-semibold text-slate-500 leading-none">
            Assessments
          </div>
        </div>

        {/* Connections */}
        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-2.5 text-center space-y-1">
          <div className="w-7 h-7 mx-auto rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div className="text-sm font-extrabold text-slate-900 leading-none">
            {connectionsCount}+
          </div>
          <div className="text-[10px] font-semibold text-slate-500 leading-none">
            Connections
          </div>
        </div>

        {/* Certificates */}
        <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-2.5 text-center space-y-1">
          <div className="w-7 h-7 mx-auto rounded-lg bg-amber-100/80 text-amber-600 flex items-center justify-center">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          </div>
          <div className="text-sm font-extrabold text-slate-900 leading-none">
            {certificatesCount}
          </div>
          <div className="text-[10px] font-semibold text-slate-500 leading-none">
            Certificates
          </div>
        </div>
      </div>

      {/* Learning Goal */}
      <div className="pt-3 mt-1 border-t border-slate-100 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            <span>Learning Goal</span>
          </div>
          <span className="font-extrabold text-slate-900">
            {learningGoalProgress}%
          </span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium truncate">
          Complete Advanced Java & System Design
        </p>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${learningGoalProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
