import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Code, 
  Cpu, 
  TrendingUp, 
  HelpCircle,
  ShieldCheck,
  Award
} from 'lucide-react';

/**
 * CandidateEvidenceProfileCard
 * Implements KASUMO Principles #5 (Self vs Demonstrated Comparison),
 * #15 (Evidence Graph), and #16 (Categorical Competency Demonstration Profile).
 */
export const CandidateEvidenceProfileCard = ({ 
  selfAssessmentLevel = 'MEDIUM', 
  demonstratedLevel = 'MEDIUM', 
  evidenceGraphJson,
  questionResults = [] 
}) => {
  let evidenceGraph = null;
  try {
    if (evidenceGraphJson) {
      evidenceGraph = typeof evidenceGraphJson === 'string' 
        ? JSON.parse(evidenceGraphJson) 
        : evidenceGraphJson;
    }
  } catch (e) {
    console.error('Failed to parse evidenceGraphJson', e);
  }

  // Derive constructive narrative
  let constructiveNarrative = evidenceGraph?.narrative;
  if (!constructiveNarrative) {
    if (selfAssessmentLevel === demonstratedLevel) {
      constructiveNarrative = `Demonstrated assessment performance aligns with your ${selfAssessmentLevel} self-evaluation, backed by deterministic test cases and sound algorithmic structure.`;
    } else if (selfAssessmentLevel === 'EXCELLENT' && demonstratedLevel === 'MEDIUM') {
      constructiveNarrative = `Your assessment results currently demonstrate strong fundamentals, while some advanced concepts require further evidence.`;
    } else if (selfAssessmentLevel === 'LOW' && (demonstratedLevel === 'MEDIUM' || demonstratedLevel === 'EXCELLENT')) {
      constructiveNarrative = `Your demonstrated technical execution exceeded your self-estimate, proving robust problem-solving ability under screening conditions.`;
    } else {
      constructiveNarrative = `Assessment evidence indicates solid technical foundations with opportunities to demonstrate further depth in edge-case handling.`;
    }
  }

  // Extract concepts demonstrated vs missed from question results
  const demonstratedConcepts = new Set();
  const missedConcepts = new Set();

  questionResults.forEach((q) => {
    try {
      if (q.codeAnalysisJson) {
        const analysis = typeof q.codeAnalysisJson === 'string'
          ? JSON.parse(q.codeAnalysisJson)
          : q.codeAnalysisJson;
        (analysis.demonstratedConcepts || []).forEach((c) => demonstratedConcepts.add(c));
        (analysis.missedConcepts || []).forEach((c) => missedConcepts.add(c));
      }
    } catch (e) {}

    // Also check standard feedback
    if (q.feedback?.conceptsTested) {
      q.feedback.conceptsTested.forEach((c) => {
        if (q.status === 'PASSED') demonstratedConcepts.add(c);
        else missedConcepts.add(c);
      });
    }
  });

  // Ensure missed concepts don't duplicate demonstrated
  demonstratedConcepts.forEach((c) => missedConcepts.delete(c));

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-1">
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            <span>KASUMO Evidence Profile</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Technical Capability Verification & Alignment
          </h2>
          <p className="text-xs text-slate-500">
            Non-punitive comparison of self-assessed intent with verified code execution proof
          </p>
        </div>

        {/* Self vs Demonstrated Comparative Pill */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 px-4 rounded-2xl border border-slate-200 shrink-0">
          <div className="text-center pr-3 border-r border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Self-Assessed
            </span>
            <span className="text-xs font-mono font-bold text-slate-700 uppercase">
              {selfAssessmentLevel || 'MEDIUM'}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Demonstrated
            </span>
            <span className={`text-xs font-mono font-bold uppercase ${
              demonstratedLevel === 'EXCELLENT' ? 'text-purple-600' :
              demonstratedLevel === 'MEDIUM' ? 'text-indigo-600' : 'text-slate-700'
            }`}>
              {demonstratedLevel || 'MEDIUM'}
            </span>
          </div>
        </div>
      </div>

      {/* Constructive Narrative Box */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4.5 space-y-1.5 text-xs text-indigo-950">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-indigo-900">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Evidence-Based Alignment Narrative</span>
        </div>
        <p className="leading-relaxed">
          {constructiveNarrative}
        </p>
      </div>

      {/* Principle #16 Competency Evidence Breakdown Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>Demonstrated Technical Competencies</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Demonstrated Concepts */}
          {Array.from(demonstratedConcepts).map((concept, idx) => (
            <div 
              key={`demo-${idx}`}
              className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-semibold text-emerald-950">{concept}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase bg-white/80 px-1.5 py-0.5 rounded border border-emerald-200">
                Demonstrated
              </span>
            </div>
          ))}

          {/* Missed / Developing Concepts */}
          {Array.from(missedConcepts).map((concept, idx) => (
            <div 
              key={`miss-${idx}`}
              className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="font-semibold text-amber-950">{concept}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-700 uppercase bg-white/80 px-1.5 py-0.5 rounded border border-amber-200">
                Developing
              </span>
            </div>
          ))}

          {demonstratedConcepts.size === 0 && missedConcepts.size === 0 && (
            <div className="col-span-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 font-mono">
              Competency parsing active across test executions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
