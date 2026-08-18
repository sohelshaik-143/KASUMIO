import api from './client';

export const evidenceApi = {
  getMyEvidence: async () => {
    const res = await api.get('/evidence');
    return res.data;
  },

  createEvidence: async (evidenceData) => {
    const res = await api.post('/evidence', evidenceData);
    return res.data;
  },

  updateEvidence: async (id, evidenceData) => {
    const res = await api.put(`/evidence/${id}`, evidenceData);
    return res.data;
  },

  deleteEvidence: async (id) => {
    await api.delete(`/evidence/${id}`);
  },

  getTemplates: async () => {
    const res = await api.get('/evidence-templates');
    return res.data;
  },

  getPendingVerification: async () => {
    const res = await api.get('/evidence/pending-verification');
    return res.data;
  },

  verifyEvidence: async (id, organizationId) => {
    const params = organizationId ? { organizationId } : {};
    const res = await api.post(`/evidence/${id}/verify`, null, { params });
    return res.data;
  },

  requestVerification: async (opportunityId, candidateAlias, evidenceId) => {
    const res = await api.post(`/opportunities/${opportunityId}/matches/${candidateAlias}/evidence/${evidenceId}/verification-request`);
    return res.data;
  },

  getRecruiterQueue: async () => {
    const res = await api.get('/recruiter/verifications');
    return res.data;
  },

  getVerificationDetail: async (id) => {
    const res = await api.get(`/recruiter/verifications/${id}`);
    return res.data;
  },

  verifyRequest: async (id, comment) => {
    const res = await api.post(`/recruiter/verifications/${id}/verify`, { comment });
    return res.data;
  },

  rejectRequest: async (id, comment) => {
    const res = await api.post(`/recruiter/verifications/${id}/reject`, { comment });
    return res.data;
  },

  getStudentVerificationStatus: async () => {
    const res = await api.get('/student/evidence/verification-status');
    return res.data;
  },
};
