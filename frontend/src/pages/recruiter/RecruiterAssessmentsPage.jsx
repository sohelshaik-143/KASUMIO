import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Code, Clock, ShieldCheck, Play, ArrowRight, Award, ChevronRight } from 'lucide-react';

export const RecruiterAssessmentsPage = () => {
  const navigate = useNavigate();

  const assessmentBlueprints = [
    {
      id: 1,
      roleTitle: 'SDE Intern - Backend Developer',
      timeLimitMinutes: 45,
      passingThreshold: 70,
      skillsEvaluated: ['Java', 'Data Structures & Algorithms', 'Spring Boot'],
      curriculum: 'Algorithmic challenges, multi-language sandbox, deterministic test suite.',
      candidatesAttempted: 12,
      candidatesPassed: 9,
      averageScore: '86%'
    },
    {
      id: 2,
      roleTitle: 'Software Engineer - Java',
      timeLimitMinutes: 45,
      passingThreshold: 75,
      skillsEvaluated: ['Java', 'System Design', 'Concurrency', 'SQL'],
      curriculum: 'Multi-threaded singleton debugging, indexed query optimization, OOP structure.',
      candidatesAttempted: 8,
      candidatesPassed: 6,
      averageScore: '82%'
    },
    {
      id: 3,
      roleTitle: 'Tech Challenge 2026',
      timeLimitMinutes: 60,
      passingThreshold: 65,
      skillsEvaluated: ['Python', 'Machine Learning', 'API Design'],
      curriculum: 'Practical model implementation and REST endpoints pipeline.',
      candidatesAttempted: 45,
      candidatesPassed: 31,
      averageScore: '78%'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Technical Screening Assessments</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
              Deterministic Sandbox
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review adaptive screening blueprints, evaluate candidates' code submissions, and inspect test case passes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/recruiter/opportunities/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <span>Configure New Blueprint</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Blueprints</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">3 Blueprints</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">Configured for active roles</span>
        </div>
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Submissions</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">65 Completed</p>
          <span className="text-xs text-blue-600 font-semibold mt-1 block">Deterministic evaluation verified</span>
        </div>
        <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Screening Pass Rate</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">70.8%</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">46 candidates passed threshold</span>
        </div>
      </div>

      <div className="space-y-4">
        {assessmentBlueprints.map((bp) => (
          <div
            key={bp.id}
            className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs hover:shadow-xs transition space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {bp.roleTitle}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                    <Code className="w-3.5 h-3.5" />
                    Screening Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {bp.curriculum}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0">
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pass Rate</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {bp.candidatesPassed} / {bp.candidatesAttempted} Passed
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Avg Score</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    {bp.averageScore}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 font-semibold">Skills Tested:</span>
                {bp.skillsEvaluated.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                <span>Time Limit: {bp.timeLimitMinutes} min</span>
                <span>•</span>
                <span>Threshold: {bp.passingThreshold}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
