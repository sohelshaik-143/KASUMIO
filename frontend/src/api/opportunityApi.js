import api from './client';

export const opportunityApi = {
  // Recruiter endpoints
  createOpportunity: async (data) => {
    const res = await api.post('/opportunities', data);
    return res.data;
  },

  getMyOpportunities: async () => {
    const res = await api.get('/opportunities');
    return res.data;
  },

  getOpportunityById: async (id) => {
    const res = await api.get(`/opportunities/${id}`);
    return res.data;
  },

  updateOpportunity: async (id, data) => {
    const res = await api.put(`/opportunities/${id}`, data);
    return res.data;
  },

  publishOpportunity: async (id) => {
    const res = await api.post(`/opportunities/${id}/publish`);
    return res.data;
  },

  closeOpportunity: async (id) => {
    const res = await api.post(`/opportunities/${id}/close`);
    return res.data;
  },

  getMatches: async (id) => {
    const res = await api.get(`/opportunities/${id}/matches`);
    return res.data;
  },

  getCandidateEvidence: async (id, candidateAlias) => {
    const res = await api.get(`/opportunities/${id}/matches/${candidateAlias}/evidence`);
    return res.data;
  },

  // Student endpoints
  getStudentOpportunities: async () => {
    const res = await api.get('/student/opportunities');
    return res.data;
  },

  expressInterest: async (id) => {
    await api.post(`/opportunities/${id}/interest`);
  },

  withdrawInterest: async (id) => {
    await api.delete(`/opportunities/${id}/interest`);
  },
};
