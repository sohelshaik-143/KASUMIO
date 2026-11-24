import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { recruiterAgentApi } from '../../api/recruiterAgentApi';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ParsedRolePreview } from './ParsedRolePreview';
import { CandidateOutreachReview } from './CandidateOutreachReview';
import {
  Sparkles,
  Sliders,
  Send,
  ExternalLink,
  RefreshCw,
  FileCheck
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
      const allAliases = response.recommendations.map((r) => r.candidateAlias);
      setSelectedAliases(allAliases);

      const notes = {};
      response.recommendations.forEach((r) => {
        notes[r.candidateAlias] = r.personalizedMessage;
      });
      setCustomNotes(notes);
    } catch (err) {
      console.error('Failed to parse intent:', err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to analyze requirements. Please try again.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExecuteOperations = async () => {
    if (!jobData?.jobId) {
      setAlert({
        type: 'error',
        message: 'Please analyze your role intent or select a quick prompt before executing.',
      });
      return;
    }

    try {
      setExecuting(true);
      setAlert({ type: null, message: null });

      const payload = {
        approvedAliases: selectedAliases,
        selectedCandidateAliases: selectedAliases,
        customOutreachNotes: customNotes,
        publishImmediately: true,
        createAssessment: assessmentConfig.enabled,
        assessmentTimeLimitMinutes: assessmentConfig.timeLimit,
        assessmentPassingPercentage: assessmentConfig.passingScore,
      };

      const result = await recruiterAgentApi.executeOperations(jobData.jobId, payload);
      setExecutionResult(result);
      setAlert({
        type: 'success',
        message: `Opportunity "${result.opportunityTitle || 'New Role'}" successfully published! Dispatched ${result.requestsSentCount || selectedAliases.length} outreach request(s).`,
      });
    } catch (err) {
      console.error('Failed to execute operations:', err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to execute outreach. Please try again.',
      });
    } finally {
      setExecuting(false);
    }
  };

  const toggleSelectCandidate = (alias) => {
    setSelectedAliases((prev) =>
      prev.includes(alias) ? prev.filter((a) => a !== alias) : [...prev, alias]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAliases.length === (jobData?.recommendations?.length || 0)) {
      setSelectedAliases([]);
    } else {
      setSelectedAliases(jobData.recommendations.map((r) => r.candidateAlias));
    }
  };

  const updateCustomNote = (alias, text) => {
    setCustomNotes((prev) => ({ ...prev, [alias]: text }));
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Rule-Based Operations Hero Banner */}
      <div className="kasumo-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-verified-light border border-verified-border text-verified text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-verified" aria-hidden="true" />
              <span>KASUMIO Structured Role Parser & Matcher</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-serif mb-2">
              Structured Requirement Parsing & Verifiable Matching
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              Describe your role requirements in plain English. KASUMIO uses rule-based parsing against our skill taxonomy, scores Day-1 readiness deterministically from verified evidence, drafts respectful outreach, and executes upon your approval.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {onSwitchToManual && (
              <button
                type="button"
                onClick={onSwitchToManual}
                className="px-4 py-2.5 rounded-lg bg-paper-subtle hover:bg-paper-border text-xs font-semibold text-ink border border-paper-border transition"
              >
                Switch to Manual Form
              </button>
            )}
          </div>
        </div>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: null, message: null })} />

      {/* Success Execution Result Banner */}
      {executionResult && (
        <div className="kasumo-card p-6 sm:p-8 space-y-5 bg-verified-light border-verified-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-verified text-white flex items-center justify-center font-bold">
              <FileCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink font-serif">
                Recruitment Workflow Successfully Executed
              </h3>
              <p className="text-xs text-ink-muted">
                Opportunity is live and candidate requests have been recorded.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-paper-border">
            <Link
              to={`/recruiter/opportunities/${executionResult.opportunityId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-verified hover:bg-verified-hover text-white text-xs font-semibold rounded-lg shadow-xs transition"
            >
              <span>View Published Opportunity</span>
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setExecutionResult(null);
                setJobData(null);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-paper-border text-ink hover:bg-paper-subtle text-xs font-semibold rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>Create Another Role</span>
            </button>
          </div>
        </div>
      )}

      {/* Intent Prompt Box */}
      {!executionResult && (
        <div className="kasumo-card p-5 sm:p-7 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="recruiter-intent-textarea" className="text-sm font-bold text-ink flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-verified" aria-hidden="true" />
              <span>Recruiter Intent Prompt</span>
            </label>
            <span className="text-xs text-ink-muted">Rule-Based Taxonomy Resolution</span>
          </div>

          <textarea
            id="recruiter-intent-textarea"
            rows={4}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            disabled={analyzing || executing}
            placeholder="Describe your desired role, required technologies, preferred skills, location, work type, and candidate criteria..."
            className="w-full px-4 py-3 text-sm text-ink bg-paper-subtle border border-paper-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-verified focus:bg-white transition resize-y font-normal"
          />

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-ink-muted font-medium">Quick Prompts:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPromptText(p.text)}
                disabled={analyzing || executing}
                className="text-xs font-medium px-2.5 py-1 rounded-md bg-paper-subtle hover:bg-paper-border text-ink border border-paper-border transition"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="pt-4 border-t border-paper-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sliders className="w-4 h-4 text-ink-muted" aria-hidden="true" />
              <label htmlFor="min-readiness-range" className="text-xs font-medium text-ink">
                Min. Day-1 Readiness:
              </label>
              <input
                id="min-readiness-range"
                type="range"
                min="30"
                max="80"
                step="5"
                value={minReadiness}
                onChange={(e) => setMinReadiness(Number(e.target.value))}
                disabled={analyzing || executing}
                className="w-24 accent-verified cursor-pointer"
              />
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-verified-light text-verified border border-verified-border tabular-nums">
                {minReadiness}%
              </span>
            </div>

            <button
              type="button"
              onClick={handleAnalyzeIntent}
              disabled={analyzing || executing || !promptText.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-verified hover:bg-verified-hover text-white text-xs font-bold rounded-lg shadow-xs transition disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Parsing Requirements & Evidence...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>Parse Intent & Discover Candidates</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Discovered Results & Action Workflow */}
      {jobData && !executionResult && (
        <div className="space-y-6">
          <ParsedRolePreview
            parsedIntent={jobData.parsedIntent}
            assessmentConfig={assessmentConfig}
            setAssessmentConfig={setAssessmentConfig}
          />

          <CandidateOutreachReview
            recommendations={jobData.recommendations}
            totalCandidatesScanned={jobData.totalCandidatesScanned}
            candidatesMatchedCount={jobData.candidatesMatchedCount}
            selectedAliases={selectedAliases}
            toggleSelectCandidate={toggleSelectCandidate}
            toggleSelectAll={toggleSelectAll}
            customNotes={customNotes}
            editingNotes={editingNotes}
            setEditingNotes={setEditingNotes}
            updateCustomNote={updateCustomNote}
          />

          {/* Final Action Bar */}
          <div className="kasumo-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-ink">
                Ready to execute recruitment workflow?
              </p>
              <p className="text-xs text-ink-muted">
                Will publish opportunity and dispatch {selectedAliases.length} connection request(s).
              </p>
            </div>
            <button
              type="button"
              disabled={executing}
              onClick={handleExecuteOperations}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-verified hover:bg-verified-hover text-white text-xs font-bold rounded-lg shadow-xs transition disabled:opacity-50"
            >
              {executing ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Executing Pipeline...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {selectedAliases.length > 0
                      ? `Publish Role & Send Outreach (${selectedAliases.length})`
                      : 'Publish Role & Activate Blueprint'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterAgentConsole;
