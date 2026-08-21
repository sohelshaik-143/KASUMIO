import api from './client';

export const outcomeApi = {
  // Get full Evidence -> Outcome Intelligence summary
  getOutcomeIntelligence: async () => {
    const res = await api.get('/student/outcome-intelligence');
    return res.data;
  },

  // Get chronological decision trace log
  getDecisionTraces: async () => {
    const res = await api.get('/student/outcome-intelligence/traces');
    return res.data;
  },

  // Trigger manual recalculation of outcome intelligence
  recalculate: async () => {
    const res = await api.post('/student/outcome-intelligence/recalculate');
    return res.data;
  }
};

export default outcomeApi;
