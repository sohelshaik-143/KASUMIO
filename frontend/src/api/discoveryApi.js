import api from './client';

export const discoveryApi = {
  // Get personalized recommendations and search
  getRecommendations: async (params = {}) => {
    const res = await api.get('/discovery/opportunities', { params });
    return res.data;
  },

  // Get full opportunity detail with deterministic match breakdown
  getOpportunityDetail: async (id) => {
    const res = await api.get(`/discovery/opportunities/${id}`);
    return res.data;
  },

  // Get multi-dimensional opportunity readiness & distance breakdown
  getOpportunityReadiness: async (id) => {
    const res = await api.get(`/discovery/opportunities/${id}/readiness`);
    return res.data;
  },

  // Get student technology gap report
  getGapReport: async () => {
    const res = await api.get('/discovery/gaps');
    return res.data;
  },

  // Get career intelligence hub (Demand, Clusters, Leverage, Evidence ROI)
  getCareerIntelligence: async () => {
    const res = await api.get('/discovery/career-intelligence');
    return res.data;
  },

  // Simulate counterfactual career what-if scenario
  simulateCareerWhatIf: async (payload) => {
    const res = await api.post('/discovery/career-what-if', payload);
    return res.data;
  },

  // Get nodes and edges for interactive Career Capability Map (Graph 1)
  getTechnologyGraph: async () => {
    const res = await api.get('/discovery/technology-graph');
    return res.data;
  },

  // Bookmark / save opportunity
  saveOpportunity: async (id, status = 'SAVED') => {
    await api.post(`/discovery/opportunities/${id}/save`, { status });
  },

  // Remove bookmark
  unsaveOpportunity: async (id) => {
    await api.delete(`/discovery/opportunities/${id}/save`);
  },

  // Get saved opportunities
  getSavedOpportunities: async () => {
    const res = await api.get('/discovery/opportunities/saved');
    return res.data;
  },

  // Get technology catalog for filters and autocomplete
  getTechnologyCatalog: async () => {
    const res = await api.get('/discovery/technologies');
    return res.data;
  },

  // Get single technology detail
  getTechnologyDetail: async (id) => {
    const res = await api.get(`/discovery/technologies/${id}`);
    return res.data;
  },

  // Dynamic Technology Candidates
  getCandidates: async (status) => {
    const res = await api.get('/discovery/candidates', { params: { status } });
    return res.data;
  },

  discoverCandidate: async (term, source) => {
    const res = await api.post('/discovery/candidates/discover', null, {
      params: { term, source }
    });
    return res.data;
  },

  verifyCandidate: async (id) => {
    await api.post(`/discovery/candidates/${id}/verify`);
  },

  rejectCandidate: async (id) => {
    await api.post(`/discovery/candidates/${id}/reject`);
  },

  // Submit deterministic feedback on recommendation
  submitFeedback: async (id, feedbackType, feedbackText = '') => {
    await api.post(`/discovery/opportunities/${id}/feedback`, { feedbackType, feedbackText });
  },

  // Get system feedback quality analytics
  getFeedbackAnalytics: async () => {
    const res = await api.get('/discovery/analytics/feedback');
    return res.data;
  }
};

export default discoveryApi;
