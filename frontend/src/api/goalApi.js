import api from './client';

export const goalApi = {
  getMyGoals: async () => {
    const res = await api.get('/career-goals');
    return res.data;
  },

  createGoal: async (goalData) => {
    const res = await api.post('/career-goals', goalData);
    return res.data;
  },

  updateGoal: async (id, goalData) => {
    const res = await api.put(`/career-goals/${id}`, goalData);
    return res.data;
  },

  deleteGoal: async (id) => {
    await api.delete(`/career-goals/${id}`);
  },
};
