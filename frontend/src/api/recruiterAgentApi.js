import api from './client';

export const recruiterAgentApi = {
  // Submit natural language intent
  initiateIntent: async (data) => {
    const res = await api.post('/recruiter/agent/intent', data);
    return res.data;
  },

  // Get job details & candidate recommendations
  getJob: async (jobId) => {
    const res = await api.get(`/recruiter/agent/jobs/${jobId}`);
    return res.data;
  },

  // One-Approval execution
  approveAndExecute: async (jobId, data) => {
    const res = await api.post(`/recruiter/agent/jobs/${jobId}/approve-and-execute`, data);
    return res.data;
  },

  // Automation policy
  getPolicy: async () => {
    const res = await api.get('/recruiter/agent/policies');
    return res.data;
  },

  updatePolicy: async (data) => {
    const res = await api.put('/recruiter/agent/policies', data);
    return res.data;
  },

  // Audit logs
  getAuditLogs: async () => {
    const res = await api.get('/recruiter/agent/audit-logs');
    return res.data;
  },
};
