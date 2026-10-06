import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { recruiterAgentApi } from '../../api/recruiterAgentApi';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';
import {
  Sparkles,
  Briefcase,
  Layers,
  MapPin,
  CheckCircle2,
  Users,
  ShieldCheck,
  Send,
  ArrowRight,
  Edit3,
  Sliders,
  ExternalLink,
  RefreshCw,
  Clock,
  Compass,
  FileCheck,
  CheckSquare,
  Square,
  AlertCircle,
  Code
} from 'lucide-react';

export const RecruiterAgentConsole = ({ onSwitchToManual }) => {
  const navigate = useNavigate();

  const [promptText, setPromptText] = useState(
    'I want to create a Java backend internship for students with Spring Boot and MySQL experience. Prioritize people who have built real projects and can work remotely.'
  );
  const [minReadiness, setMinReadiness] = useState(50);
  const [assessmentConfig, setAssessmentConfig] = useState({
    enabled: true,
    timeLimit: 45,
    passingScore: 70,
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [jobData, setJobData] = useState(null);
  const [selectedAliases, setSelectedAliases] = useState([]);
  const [customNotes, setCustomNotes] = useState({});
  const [editingNotes, setEditingNotes] = useState({});
  const [alert, setAlert] = useState({ type: null, message: null });
  const [executionResult, setExecutionResult] = useState(null);

  const samplePrompts = [
    {
      label: 'Java Backend Intern (Remote)',
      text: 'I want to create a Java backend internship for students with Spring Boot and MySQL experience. Prioritize people who have built real projects and can work remotely.',
    },
    {
      label: 'Frontend React Engineer (Hybrid)',
      text: 'Looking for a Frontend React intern with TypeScript and TailwindCSS experience. Candidates must have verified web project evidence. Hybrid in Bangalore.',
    },
    {
      label: 'Full Stack Python Developer (Remote)',
      text: 'Need a Full Stack intern with FastAPI, PostgreSQL, and React skills. Prioritize candidates who have demonstrable API projects and Git version control history. Remote.',
    },
  ];

  const handleAnalyzeIntent = async () => {
    if (!promptText.trim()) {
      setAlert({ type: 'error', message: 'Please enter your recruitment requirements.' });
      return;
    }

    try {
      setAnalyzing(true);
      setAlert({ type: null, message: null });
      setExecutionResult(null);

      const response = await recruiterAgentApi.initiateIntent({
        intent: promptText.trim(),
        minReadinessThreshold: minReadiness,
        maxCandidates: 10,
      });

      setJobData(response);
      // Pre-select all recommended candidates by default
      const allAliases = response.recommendations.map((r) => r.candidateAlias);
      setSelectedAliases(allAliases);

      // Pre-populate outreach notes
      const notes = {};
      response.recommendations.forEach((r) => {
        notes[r.candidateAlias] = r.personalizedMessage;
      });
      setCustomNotes(notes);
    } catch (err) {
      console.error('Failed to analyze intent:', err);
      const msg = err.response?.data?.message || 'Failed to analyze recruiter intent. Please check your connection.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleSelectCandidate = (alias) => {
    setSelectedAliases((prev) =>
      prev.includes(alias) ? prev.filter((a) => a !== alias) : [...prev, alias]
    );
  };

  const toggleSelectAll = () => {
    if (!jobData) return;
    if (selectedAliases.length === jobData.recommendations.length) {
      setSelectedAliases([]);
    } else {
      setSelectedAliases(jobData.recommendations.map((r) => r.candidateAlias));
    }
  };

  const handleNoteChange = (alias, value) => {
    setCustomNotes((prev) => ({ ...prev, [alias]: value }));
  };

  const handleApproveAndExecute = async (publishImmediately = true) => {
    if (!jobData) return;
    if (selectedAliases.length === 0) {
      setAlert({ type: 'error', message: 'Please select at least one candidate to send outreach to.' });
      return;
    }

    try {
      setExecuting(true);
      setAlert({ type: null, message: null });

      const response = await recruiterAgentApi.approveAndExecute(jobData.jobId, {
        approvedAliases: selectedAliases,
        customOutreachNotes: customNotes,
        publishImmediately,
      });

      setExecutionResult(response);
      setAlert({
        type: 'success',
        message: `Workflow executed! Opportunity published and connection requests dispatched to ${response.outreachSentCount} candidate(s).`,
      });
    } catch (err) {
      console.error('Execution failed:', err);
      const msg = err.response?.data?.message || 'Failed to execute workflow. Please review your policies.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Agent Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>KASUMO Autonomous Recruiter Operations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              From Plain Intent to Approved Outreach in Minutes
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Describe your role requirements in plain English. KASUMO investigates demonstrable code artifacts, scores Day-1 readiness deterministically, drafts respectful outreach, and executes upon your approval.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {onSwitchToManual && (
              <button
                type="button"
                onClick={onSwitchToManual}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              >
                Switch to Manual Form
              </button>
            )}
          </div>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {/* Execution Complete Screen */}
      {executionResult && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] uppercase tracking-widest font-bold text-emerald-700">
                Workflow Successfully Executed
              </span>
              <h3 className="text-xl font-bold text-emerald-950 mt-1">
                {executionResult.parsedIntent?.roleTitle || 'Opportunity'} is Live & Outreach Sent!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 mt-2 max-w-2xl">
                The role has been published to the candidate discovery feed. We dispatched personalized connection requests to {executionResult.outreachSentCount} evidence-backed candidates.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-5">
                {executionResult.opportunityId && (
                  <Link
                    to={`/recruiter/opportunities/${executionResult.opportunityId}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>View Role Dashboard</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                )}
                <Link
                  to="/recruiter/connections"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold shadow-xs transition"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Track Candidate Connections</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setExecutionResult(null);
                    setJobData(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Start Another Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Intent Prompt Box */}
      {!executionResult && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between gap-4 mb-4">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Recruiter Intent Prompt</span>
            </label>
            <span className="text-xs text-slate-400">Powered by Technology Intelligence Graph</span>
          </div>

          <textarea
            rows={4}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            disabled={analyzing || executing}
            placeholder="Describe your desired role, required technologies, preferred skills, location, work type, and candidate criteria..."
            className="w-full px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition resize-y font-normal"
          />

          {/* Quick Prompt Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Quick Prompts:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPromptText(p.text)}
                disabled={analyzing || executing}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 transition"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sliders className="w-4 h-4 text-slate-400" />
              <label className="text-xs font-medium text-slate-700">
                Min. Day-1 Readiness Threshold:
              </label>
              <input
                type="range"
                min="30"
                max="80"
                step="5"
                value={minReadiness}
                onChange={(e) => setMinReadiness(Number(e.target.value))}
                disabled={analyzing || executing}
                className="w-24 accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {minReadiness}%
              </span>
            </div>

            <button
              type="button"
              onClick={handleAnalyzeIntent}
              disabled={analyzing || executing || !promptText.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Investigating Evidence & Graph...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Understand Intent & Discover Candidates</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Discovered Results & Action Workflow */}
      {jobData && !executionResult && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {/* Understood Intent Summary Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600">
                  Understood Intent & Generated Opportunity
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {jobData.parsedIntent?.roleTitle}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold uppercase">
                  {jobData.parsedIntent?.opportunityType}
                </span>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-semibold uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {jobData.parsedIntent?.workType} • {jobData.parsedIntent?.location}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills Extraction Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Technology Requirements (Resolved via Taxonomy)
                </h4>
                <div>
                  <span className="text-[11px] font-semibold text-emerald-700 block mb-1.5">
                    Required Core Technologies (Must Have Evidence):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jobData.parsedIntent?.requiredSkills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {jobData.parsedIntent?.preferredSkills?.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-indigo-700 block mb-1.5">
                      Preferred Technologies (Bonus Alignment):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {jobData.parsedIntent?.preferredSkills?.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Generated Description Preview */}
              <div className="space-y-2 bg-slate-50/70 border border-slate-200 rounded-xl p-4">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Generated Role Summary & Responsibilities
                </span>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                  {jobData.parsedIntent?.generatedDescription}
                </p>
                <div className="pt-2 text-[11px] text-slate-500 whitespace-pre-line line-clamp-3">
                  {jobData.parsedIntent?.generatedResponsibilities}
                </div>
              </div>
            </div>

            {/* Round-1 Technical Screening Blueprint */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    AI Round-1 Technical Screening Blueprint (Automated)
                  </span>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={assessmentConfig.enabled}
                    onChange={(e) => setAssessmentConfig({ ...assessmentConfig, enabled: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-indigo-600"
                  />
                  <span>Active for this role</span>
                </label>
              </div>

              {assessmentConfig.enabled && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Time Limit:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="15"
                        max="180"
                        value={assessmentConfig.timeLimit}
                        onChange={(e) => setAssessmentConfig({ ...assessmentConfig, timeLimit: parseInt(e.target.value) || 45 })}
                        className="w-20 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold"
                      />
                      <span className="text-slate-500">minutes</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Passing Threshold:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="30"
                        max="100"
                        value={assessmentConfig.passingScore}
                        onChange={(e) => setAssessmentConfig({ ...assessmentConfig, passingScore: parseInt(e.target.value) || 70 })}
                        className="w-20 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold"
                      />
                      <span className="text-slate-500">% score</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Curriculum:</span>
                    <span className="text-[11px] text-slate-600">
                      Algorithms, multi-language sandbox, deterministic test suite.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Candidate Recommendations Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Evidence-First Shortlisted Candidates ({jobData.recommendations?.length || 0})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scanned {jobData.totalCandidatesScanned} candidates. Surfaced {jobData.candidatesMatchedCount} matching profiles strictly from demonstrable code artifacts.
                </p>
              </div>

              {jobData.recommendations?.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 self-start sm:self-auto"
                >
                  {selectedAliases.length === jobData.recommendations.length ? (
                    <>
                      <CheckSquare className="w-4 h-4" />
                      <span>Deselect All</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4" />
                      <span>Select All ({jobData.recommendations.length})</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {jobData.recommendations?.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900">No candidates met the threshold</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Try lowering the readiness threshold slider (e.g. to 40%) or expanding your required skills to discover more candidates.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {jobData.recommendations.map((cand) => {
                  const isSelected = selectedAliases.includes(cand.candidateAlias);
                  const isEditingNote = editingNotes[cand.candidateAlias];

                  return (
                    <div
                      key={cand.candidateAlias}
                      className={`bg-white border rounded-2xl p-5 transition-all shadow-xs ${
                        isSelected ? 'border-indigo-300 ring-1 ring-indigo-500/10' : 'border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        {/* Candidate Identity & Scores */}
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => toggleSelectCandidate(cand.candidateAlias)}
                            className="mt-1 text-slate-400 hover:text-indigo-600 transition"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300" />
                            )}
                          </button>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                {cand.candidateAlias}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500 uppercase">
                                Anonymous Profile
                              </span>
                            </div>

                            {/* Why Recommended Pill */}
                            <div className="mt-2 bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-950 max-w-xl">
                              <span className="font-bold text-indigo-900 flex items-center gap-1 mb-1">
                                <Sparkles className="w-3 h-3 text-indigo-600" />
                                Why KASUMO Recommended This Candidate:
                              </span>
                              <p className="leading-relaxed text-indigo-900/90">
                                {cand.whyRecommended}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Readiness & Evidence Strength Gauges */}
                        <div className="flex items-center gap-4 shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-3 self-start">
                          <div className="text-center">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">
                              Day-1 Readiness
                            </span>
                            <span className="text-lg font-black text-emerald-600 font-mono">
                              {cand.readinessScore}%
                            </span>
                          </div>
                          <div className="w-px h-8 bg-slate-200" />
                          <div className="text-center">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">
                              Evidence Strength
                            </span>
                            <span className="text-lg font-black text-indigo-600 font-mono">
                              {cand.evidenceStrengthScore}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Evidence Provenance Badges */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600 mr-1">Evidence Provenance:</span>
                        {cand.observedProjects?.map((proj, pIdx) => (
                          <span
                            key={pIdx}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            <FileCheck className="w-3 h-3 text-emerald-600" />
                            {proj}
                          </span>
                        ))}

                        {cand.verifiedEvidence?.map((ver, vIdx) => (
                          <span
                            key={vIdx}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200"
                          >
                            <ShieldCheck className="w-3 h-3 text-blue-600" />
                            Verified: {ver}
                          </span>
                        ))}

                        {cand.inferredCapabilities?.map((inf, iIdx) => (
                          <span
                            key={iIdx}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200"
                          >
                            Inferred: {inf}
                          </span>
                        ))}
                      </div>

                      {/* Outreach Draft Preview & Edit */}
                      <div className="mt-4 bg-slate-50/80 rounded-xl p-3 border border-slate-200">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                            <Send className="w-3 h-3 text-slate-500" />
                            <span>Personalized Outreach Invitation Note</span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingNotes((prev) => ({
                                ...prev,
                                [cand.candidateAlias]: !prev[cand.candidateAlias],
                              }))
                            }
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{isEditingNote ? 'Done' : 'Edit Note'}</span>
                          </button>
                        </div>

                        {isEditingNote ? (
                          <textarea
                            rows={3}
                            value={customNotes[cand.candidateAlias] || ''}
                            onChange={(e) => handleNoteChange(cand.candidateAlias, e.target.value)}
                            className="w-full text-xs p-2.5 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                          />
                        ) : (
                          <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-2">
                            "{customNotes[cand.candidateAlias] || cand.personalizedMessage}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sticky / One Approval Execution Bar */}
          {jobData.recommendations?.length > 0 && (
            <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md border border-indigo-200 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {selectedAliases.length}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedAliases.length} candidate(s) selected for instant outreach
                  </h4>
                  <p className="text-xs text-slate-500">
                    One approval will publish the role and dispatch personalized connection requests.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleApproveAndExecute(false)}
                  disabled={executing || selectedAliases.length === 0}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveAndExecute(true)}
                  disabled={executing || selectedAliases.length === 0}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-98 disabled:opacity-50"
                >
                  {executing ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Executing Workflow...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Execute Outreach</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
