import api from './client';

export const leaderboardApi = {
  getLeaderboard: async (params = {}) => {
    const response = await api.get('/leaderboard', { params });
    return response.data;
  },

  getPrivacy: async () => {
    const response = await api.get('/leaderboard/privacy');
    return response.data;
  },

  updatePrivacy: async (isPublic) => {
    const response = await api.put('/leaderboard/privacy', { isPublic });
    return response.data;
  },
};
