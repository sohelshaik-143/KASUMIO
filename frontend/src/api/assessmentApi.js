import api from './client';

export const assessmentApi = {
  // Get all active assessments
  getAllAssessments: async () => {
    const response = await api.get('/assessments');
    return response.data;
  },

  // Get or generate assessment for an opportunity
  getAssessmentForOpportunity: async (opportunityId) => {
    const response = await api.get(`/assessments/opportunity/${opportunityId}`);
    return response.data;
  },

  // Recruiter triggers blueprint generation
  generateBlueprint: async (opportunityId) => {
    const response = await api.post(`/assessments/generate/${opportunityId}`);
    return response.data;
  },

  // Recruiter updates blueprint thresholds & metadata
  updateAssessment: async (assessmentId, updateData) => {
    const response = await api.put(`/assessments/${assessmentId}`, updateData);
    return response.data;
  },

  // Candidate starts assessment attempt
  startAttempt: async (assessmentId, startData = {}) => {
    const response = await api.post(`/assessments/${assessmentId}/start`, startData);
    return response.data;
  },

  // Ingest non-punitive real-time assessment telemetry
  recordTelemetry: async (attemptId, telemetryData) => {
    const response = await api.post(`/assessments/attempts/${attemptId}/telemetry`, telemetryData);
    return response.data;
  },

  // Recruiter records a human verification decision
  recordRecruiterDecision: async (attemptId, decisionData) => {
    const response = await api.post(`/assessments/attempts/${attemptId}/recruiter-decision`, decisionData);
    return response.data;
  },

  // Agent autonomously solves assessment questions & mints verified capability
  agentTakeAssessment: async (assessmentId) => {
    const response = await api.post(`/assessments/${assessmentId}/agent-take`);
    return response.data;
  },

  // Fetch next adaptive question
  getNextQuestion: async (attemptId) => {
    const response = await api.get(`/assessments/attempts/${attemptId}/next-question`);
    return response.data;
  },

  // Run code against public sample cases in isolated sandbox
  runCode: async (attemptId, questionId, runData) => {
    const response = await api.post(
      `/assessments/attempts/${attemptId}/questions/${questionId}/run-code`,
      runData
    );
    return response.data;
  },

  // Submit answer (code or option) for deterministic evaluation
  submitQuestion: async (attemptId, submissionData) => {
    const response = await api.post(
      `/assessments/attempts/${attemptId}/submit`,
      submissionData
    );
    return response.data;
  },

  // Finalize attempt
  completeAttempt: async (attemptId) => {
    const response = await api.post(`/assessments/attempts/${attemptId}/complete`);
    return response.data;
  },

  // Candidate gets attempt results
  getAttemptResult: async (attemptId) => {
    const response = await api.get(`/assessments/attempts/${attemptId}/result`);
    return response.data;
  },

  // Recruiter inspects candidate assessment submission code and test telemetry
  getCandidateResultsForRecruiter: async (opportunityId, studentId) => {
    const response = await api.get(
      `/assessments/opportunity/${opportunityId}/candidate-results/${studentId}`
    );
    return response.data;
  },

  // Recruiter inspects candidate assessment submission code and test telemetry by alias
  getCandidateResultsByAliasForRecruiter: async (opportunityId, candidateAlias) => {
    const response = await api.get(
      `/assessments/opportunity/${opportunityId}/candidate-alias-results/${candidateAlias}`
    );
    return response.data;
  },
};
