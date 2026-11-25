import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Code, 
  Terminal, 
  Cpu, 
  Layers,
  Sparkles,
  Check
} from 'lucide-react';

/**
 * QuestionDiagnosticAccordionItem
 * Renders per-question execution results, code analysis, and non-punitive complexity insights.
 */
export const QuestionDiagnosticAccordionItem = ({ item, isExpanded, onToggle }) => {
  const isPassed = item.status === 'PASSED';
  const fb = item.feedback;

  let analysis = null;
  try {
    if (item.codeAnalysisJson) {
      analysis = typeof item.codeAnalysisJson === 'string'
        ? JSON.parse(item.codeAnalysisJson)
        : item.codeAnalysisJson;
    }
  } catch (e) {}

  let evalLayers = null;
  try {
    if (item.evaluationLayersJson) {
      evalLayers = typeof item.evaluationLayersJson === 'string'
        ? JSON.parse(item.evaluationLayersJson)
        : item.evaluationLayersJson;
    }
  } catch (e) {}

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition">
      {/* Header */}
      <div
        onClick={onToggle}
        className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition"
      >
        <div className="flex items-center gap-3">
          {isPassed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {item.skillName} • {item.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {item.questionType === 'CODING'
                ? `Passed ${item.testCasesPassed}/${item.totalTestCases} test cases (${item.executionTimeMs}ms)`
                : isPassed ? 'Conceptual choice verified' : 'Incorrect concept choice'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-700">
            {item.pointsEarned} / {item.maxPoints} pts
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Expanded Diagnostic Details */}
      {isExpanded && (
        <div className="p-5 pt-0 border-t border-slate-100 space-y-4 text-xs bg-slate-50/40">
          {/* Deep Code Analysis Banner (Principle #4) */}
          {analysis && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 pt-4 shadow-2xs mt-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Code Analysis & Complexity Engine</span>
                </span>
                <span className="font-mono text-xs text-slate-500">
                  Approach: <strong className="text-indigo-600">{analysis.algorithmicApproach || 'Algorithmic'}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-400 block uppercase">Time Complexity</span>
                  <span className="font-bold text-indigo-700">{analysis.estimatedTimeComplexity || 'O(N)'}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-400 block uppercase">Space Complexity</span>
                  <span className="font-bold text-indigo-700">{analysis.estimatedSpaceComplexity || 'O(1)'}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-400 block uppercase">Quality Rating</span>
                  <span className="font-bold text-emerald-700">{analysis.codeQualityRating || 'GOOD'}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-xs text-slate-400 block uppercase">Similarity Check</span>
                  <span className="font-bold text-slate-700">
                    {item.similarityScore ? `${Math.round(item.similarityScore * 100)}%` : 'Clean (0%)'}
                  </span>
                </div>
              </div>

              {/* Demonstrated vs Missed Concepts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {analysis.demonstratedConcepts?.length > 0 && (
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1">
                    <span className="font-bold text-emerald-900 text-xs uppercase block">
                      Demonstrated Concepts:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {analysis.demonstratedConcepts.map((c, i) => (
                        <span key={i} className="text-xs bg-white text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 font-mono">
                          ✓ {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.missedConcepts?.length > 0 && (
                  <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg space-y-1">
                    <span className="font-bold text-slate-700 text-xs uppercase block">
                      Opportunity for Growth:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {analysis.missedConcepts.map((c, i) => (
                        <span key={i} className="text-xs bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                          ○ {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4-Layer Auditable Evaluation Breakdown */}
          {evalLayers && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>4-Layer Auditable Evaluation Evidence</span>
                </span>
                {evalLayers.layer4Review?.reviewedScore != null ? (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                    Recruiter Verified ({evalLayers.layer4Review.reviewedScore} pts)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-full">
                    Deterministic Marks ({evalLayers.layer2Marks?.pointsEarned || item.pointsEarned} pts)
                  </span>
                )}
              </div>

              {/* Layer 3: AI Strengths & Weaknesses */}
              {evalLayers.layer3AiSuggestions && (
                <div className="space-y-2">
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {evalLayers.layer3AiSuggestions.explanation}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {evalLayers.layer3AiSuggestions.strengths?.length > 0 && (
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1">
                        <span className="font-bold text-emerald-900 text-xs block">Demonstrated Strengths:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                          {evalLayers.layer3AiSuggestions.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                    {evalLayers.layer3AiSuggestions.weaknesses?.length > 0 && (
                      <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1">
                        <span className="font-bold text-amber-900 text-xs block">Areas for Refinement:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                          {evalLayers.layer3AiSuggestions.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                  {evalLayers.layer3AiSuggestions.recommendedConcepts && (
                    <p className="text-slate-500 text-[11px] font-mono pt-1">
                      Targeted Practice: <strong>{evalLayers.layer3AiSuggestions.recommendedConcepts}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Feedback summary */}
          {fb && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <span className="font-bold text-emerald-900 uppercase text-xs tracking-wider">
                  What Worked
                </span>
                <p className="text-emerald-950 leading-relaxed">{fb.whatWorked}</p>
              </div>

              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
                <span className="font-bold text-rose-900 uppercase text-xs tracking-wider">
                  Identified Issue
                </span>
                <p className="text-rose-950 leading-relaxed">{fb.whatFailed}</p>
              </div>
            </div>
          )}

          {/* Submitted Code Preview */}
          {item.submittedCode && (
            <div className="space-y-1 pt-1">
              <span className="font-bold text-slate-600 uppercase text-xs tracking-wider font-mono">
                Submitted {item.language || 'Code'}
              </span>
              <pre className="p-3 bg-slate-900 text-slate-200 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800">
                {item.submittedCode}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
