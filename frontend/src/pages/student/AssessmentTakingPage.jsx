import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import {
  Code,
  Play,
  Send,
  Terminal,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Cpu,
  Layers,
  ChevronRight,
  Maximize2,
  FileCode,
  Check,
  RotateCcw
} from 'lucide-react';

export const AssessmentTakingPage = () => {
  const { assessmentId, attemptId } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [runningCode, setRunningCode] = useState(false);
  const [agentRunning, setAgentRunning] = useState(false);
  const [alert, setAlert] = useState({ type: null, message: null });

  // Code state
  const [selectedLanguage, setSelectedLanguage] = useState('java');
  const [codeContent, setCodeContent] = useState('');
  const [runTelemetry, setRunTelemetry] = useState(null);

  // MCQ / Option state
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  // Adaptive progress state
  const [questionNumber, setQuestionNumber] = useState(1);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState('MEDIUM');
  const [totalScore, setTotalScore] = useState(0);

  // Non-punitive assessment telemetry signals
  const [focusChangeCount, setFocusChangeCount] = useState(0);
  const [pasteCount, setPasteCount] = useState(0);
  const [keystrokeCount, setKeystrokeCount] = useState(0);
  const [largeChangesCount, setLargeChangesCount] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const previousCodeLengthRef = React.useRef(0);

  useEffect(() => {
    const handleBlur = () => {
      setFocusChangeCount((prev) => prev + 1);
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  useEffect(() => {
    setQuestionStartTime(Date.now());
    setFocusChangeCount(0);
    setPasteCount(0);
    setKeystrokeCount(0);
    setLargeChangesCount(0);
    previousCodeLengthRef.current = 0;
    fetchNextQuestion();
  }, [attemptId]);

  const fetchNextQuestion = async () => {
    try {
      setLoadingQuestion(true);
      setRunTelemetry(null);
      setSelectedOptionId(null);

      const nextQ = await assessmentApi.getNextQuestion(attemptId);
      if (!nextQ) {
        // No more questions -> complete attempt
        await handleFinishAssessment();
        return;
      }

      setQuestion(nextQ);
      setAdaptiveDifficulty(nextQ.difficulty);

      // Pre-populate code if coding problem
      if (nextQ.codingProblem) {
        const starterMap = nextQ.codingProblem.starterCodeByLang || {};
        const availableLangs = nextQ.codingProblem.allowedLanguages || ['java', 'python', 'javascript'];
        const initialLang = availableLangs.includes(selectedLanguage) ? selectedLanguage : availableLangs[0];
        setSelectedLanguage(initialLang);
        setCodeContent(starterMap[initialLang] || starterMap['java'] || '// Write your solution here\n');
      }
    } catch (err) {
      console.error('Failed to load next question:', err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Could not retrieve next question.'
      });
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    if (question?.codingProblem?.starterCodeByLang?.[newLang]) {
      const starter = question.codingProblem.starterCodeByLang[newLang];
      setCodeContent(starter);
      previousCodeLengthRef.current = starter.length;
    }
  };

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    const diff = Math.abs(newCode.length - previousCodeLengthRef.current);
    if (diff > 80) {
      setLargeChangesCount((prev) => prev + 1);
    }
    previousCodeLengthRef.current = newCode.length;
    setCodeContent(newCode);
    setKeystrokeCount((prev) => prev + 1);
  };

  const handlePaste = () => {
    setPasteCount((prev) => prev + 1);
  };

  const handleRunCode = async () => {
    if (!question || !codeContent.trim()) return;

    try {
      setRunningCode(true);
      setAlert({ type: null, message: null });

      const res = await assessmentApi.runCode(attemptId, question.id, {
        language: selectedLanguage,
        code: codeContent,
        customInput: ''
      });

      setRunTelemetry(res);
    } catch (err) {
      console.error('Failed to run code:', err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Code execution sandbox error.'
      });
    } finally {
      setRunningCode(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!question) return;

    if (question.questionType === 'CODING' && !codeContent.trim()) {
      setAlert({ type: 'error', message: 'Please provide code before submitting.' });
      return;
    }

    if (question.questionType !== 'CODING' && !selectedOptionId) {
      setAlert({ type: 'error', message: 'Please select an option to submit.' });
      return;
    }

    try {
      setSubmitting(true);
      setAlert({ type: null, message: null });

      const durationSeconds = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
      const res = await assessmentApi.submitQuestion(attemptId, {
        questionId: question.id,
        language: selectedLanguage,
        code: codeContent,
        selectedOptionId: selectedOptionId,
        focusChangeCount: focusChangeCount,
        pasteCount: pasteCount,
        keystrokeCount: keystrokeCount,
        largeChangesCount: largeChangesCount,
        timeSpentSeconds: durationSeconds
      });

      setTotalScore(res.totalAttemptScore);
      setAdaptiveDifficulty(res.nextDifficulty);

      // Reset telemetry for next question
      setFocusChangeCount(0);
      setPasteCount(0);
      setKeystrokeCount(0);
      setLargeChangesCount(0);
      setQuestionStartTime(Date.now());
      previousCodeLengthRef.current = 0;

      if (res.hasNextQuestion) {
        setQuestionNumber((prev) => prev + 1);
        await fetchNextQuestion();
      } else {
        await handleFinishAssessment();
      }
    } catch (err) {
      console.error('Failed to submit question:', err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit question.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishAssessment = async () => {
    try {
      const result = await assessmentApi.completeAttempt(attemptId);
      navigate(`/student/assessments/attempts/${attemptId}/result`);
    } catch (err) {
      console.error('Failed to complete assessment:', err);
      navigate(`/student/assessments/attempts/${attemptId}/result`);
    }
  };

  const handleAgentAutoSolve = async () => {
    try {
      setAgentRunning(true);
      setAlert({
        type: 'info',
        message: '🤖 AI Agent is autonomously completing all technical & LeetCode DSA questions...'
      });
      const result = await assessmentApi.agentTakeAssessment(assessmentId);
      setAlert({
        type: 'success',
        message: `Assessment successfully solved! Final Score: ${result.score}% (${result.status}). Redirecting to results...`
      });
      setTimeout(() => {
        navigate(`/student/assessments/attempts/${result.attemptId || attemptId}/result`);
      }, 1200);
    } catch (err) {
      console.error('Agent auto solve failed:', err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Agent auto-solve encountered an issue.'
      });
    } finally {
      setAgentRunning(false);
    }
  };

  if (loadingQuestion) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <LoadingSpinner size="lg" text="Initializing adaptive evaluation sandbox..." />
        <p className="text-xs text-slate-500">Preparing compiler runtime & test case verifiers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      {/* Top Telemetry Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 px-5 text-white flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 font-bold font-mono text-sm">
            Q{questionNumber}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">{question?.title}</h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  adaptiveDifficulty === 'HARD'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : adaptiveDifficulty === 'MEDIUM'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                Adaptive: {adaptiveDifficulty}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Competency: <strong className="text-indigo-300">{question?.skillName}</strong> • {question?.points} pts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAgentAutoSolve}
            disabled={agentRunning || submitting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
            title="Auto-solve technical screening using AI agent"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>{agentRunning ? 'Solving...' : '🤖 AI Agent Solve'}</span>
          </button>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Score</span>
            <p className="text-sm font-bold text-emerald-400 font-mono">{totalScore} pts</p>
          </div>
          <button
            onClick={handleFinishAssessment}
            className="text-xs text-slate-400 hover:text-white underline underline-offset-4 transition"
          >
            End & View Result
          </button>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {/* Main Assessment Body: Left Problem, Right Editor/Options */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* Left Column: Problem Prompt & Constraints */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4 overflow-y-auto max-h-[640px] pr-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                {question?.questionType} ASSESSMENT
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{question?.title}</h3>
            </div>

            <div className="prose prose-sm text-slate-700 leading-relaxed whitespace-pre-line text-xs sm:text-sm bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {question?.prompt}
            </div>

            {/* If coding problem, show problem statement and constraints */}
            {question?.codingProblem && (
              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Problem Specification
                  </h4>
                  <p className="text-xs text-slate-700 whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {question.codingProblem.problemStatement}
                  </p>
                </div>

                {question.codingProblem.constraints && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Constraints
                    </h4>
                    <p className="text-xs font-mono text-slate-600 bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                      {question.codingProblem.constraints}
                    </p>
                  </div>
                )}

                {/* Sample Test Cases */}
                {question.codingProblem.sampleTestCases?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Sample Test Cases
                    </h4>
                    {question.codingProblem.sampleTestCases.map((tc, idx) => (
                      <div key={idx} className="bg-slate-900 rounded-xl p-3 text-xs font-mono text-slate-200 space-y-1.5 border border-slate-800">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1">
                          <span>Sample #{idx + 1}</span>
                          <span className="text-indigo-400">{tc.explanation || 'Example Case'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Input: </span>
                          <span className="text-amber-300">{tc.inputData}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Expected: </span>
                          <span className="text-emerald-300">{tc.expectedOutput}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Code Sandbox OR Multiple-Choice Options */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between overflow-hidden">
          {question?.questionType === 'CODING' ? (
            <div className="flex-1 flex flex-col">
              {/* Editor Header: Language Switcher & Run Button */}
              <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">Sandbox Environment</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="ml-2 bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg px-2.5 py-1 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="java">Java 21 (Temurin)</option>
                    <option value="python">Python 3.12</option>
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="typescript">TypeScript</option>
                    <option value="cpp">C++ 17</option>
                    <option value="go">Go 1.22</option>
                    <option value="rust">Rust</option>
                    <option value="kotlin">Kotlin</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunCode}
                    disabled={runningCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    {runningCode ? (
                      <span>Executing...</span>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Run Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Textarea with Monospace styling */}
              <div className="flex-1 bg-slate-950 p-4 min-h-[300px]">
                <textarea
                  value={codeContent}
                  onChange={handleCodeChange}
                  onPaste={handlePaste}
                  spellCheck="false"
                  className="w-full h-full min-h-[280px] bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none selection:bg-indigo-600 selection:text-white"
                  placeholder="// Implement your solution..."
                />
              </div>

              {/* Run Telemetry Console */}
              {runTelemetry && (
                <div className="border-t border-slate-800 bg-slate-900 p-4 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800">
                    <span className="font-bold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Sandbox Telemetry</span>
                    </span>
                    <span className="text-slate-400">
                      Duration: <strong>{runTelemetry.executionTimeMs}ms</strong>
                    </span>
                  </div>

                  {runTelemetry.compilationError && (
                    <div className="text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/50 whitespace-pre-wrap">
                      {runTelemetry.compilationOutput}
                    </div>
                  )}

                  {runTelemetry.timedOut && (
                    <div className="text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/50">
                      Time Limit Exceeded (&gt; 4000ms). Infinite loop or heavy complexity detected.
                    </div>
                  )}

                  {/* Sample test results */}
                  {runTelemetry.sampleResults?.map((res, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        res.passed
                          ? 'bg-emerald-950/30 text-emerald-300 border-emerald-900/50'
                          : 'bg-rose-950/30 text-rose-300 border-rose-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {res.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                        <span>Sample #{i + 1}</span>
                      </div>
                      <div className="text-[11px] text-right font-mono">
                        <span>Expected: {res.expectedOutput}</span> • <span>Output: {res.actualOutput}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Non-Coding: Multiple Choice / Debugging / Conceptual Options */
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select the most accurate technical solution:
                </span>
                <div className="space-y-2.5">
                  {question?.options?.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`p-4 rounded-xl border text-xs sm:text-sm cursor-pointer transition flex items-start gap-3 ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-semibold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="leading-relaxed">{opt.optionText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-mono">
              Evaluated deterministically • Evidence-backed
            </div>
            <button
              onClick={handleSubmitAnswer}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {submitting ? (
                <span>Evaluating Submission...</span>
              ) : (
                <>
                  <span>Submit Answer</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
