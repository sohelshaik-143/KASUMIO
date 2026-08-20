import api from './client';

export const actionApi = {
  // Get primary "Your Next Move" action and alternatives
  getNextAction: async () => {
    const res = await api.get('/student/career/next-action');
    return res.data;
  },

  // Get full action details
  getActionDetails: async (id) => {
    const res = await api.get(`/student/career/actions/${id}`);
    return res.data;
  },

  // Record action started
  startAction: async (id) => {
    await api.post(`/student/career/actions/${id}/start`);
  },

  // Record action completed with optional evidence ID
  completeAction: async (id, evidenceId = null) => {
    await api.post(`/student/career/actions/${id}/complete`, null, {
      params: { evidenceId }
    });
  },

  // Get readiness impact for an action
  getActionImpact: async (id) => {
    const res = await api.get(`/student/career/action-impact/${id}`);
    return res.data;
  },

  // Submit feedback on an action recommendation
  submitFeedback: async (actionId, feedbackType, feedbackText = '') => {
    await api.post('/student/career/feedback', { actionId, feedbackType, feedbackText });
  }
};

export default actionApi;
