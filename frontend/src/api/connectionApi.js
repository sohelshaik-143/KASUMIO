import api from './client';

export const connectionApi = {
  // Recruiter endpoints
  requestConnection: async (opportunityId, candidateAlias, note) => {
    const res = await api.post(`/opportunities/${opportunityId}/candidates/${candidateAlias}/connect`, {
      recruiterNote: note,
    });
    return res.data;
  },

  getRecruiterConnections: async () => {
    const res = await api.get('/recruiter/connections');
    return res.data;
  },

  getRecruiterConnectionById: async (id) => {
    const res = await api.get(`/recruiter/connections/${id}`);
    return res.data;
  },

  cancelRecruiterConnection: async (id) => {
    await api.post(`/recruiter/connections/${id}/cancel`);
  },

  // Student endpoints
  getStudentConnections: async () => {
    const res = await api.get('/student/connections');
    return res.data;
  },

  acceptStudentConnection: async (id, consentData) => {
    const res = await api.post(`/student/connections/${id}/accept`, consentData);
    return res.data;
  },

  declineStudentConnection: async (id) => {
    const res = await api.post(`/student/connections/${id}/decline`);
    return res.data;
  },

  cancelStudentConnection: async (id) => {
    await api.post(`/student/connections/${id}/cancel`);
  },
};
