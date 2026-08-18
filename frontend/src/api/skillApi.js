import api from './client';

export const skillApi = {
  getAllSkills: async () => {
    const res = await api.get('/skills');
    return res.data;
  },

  createSkill: async (skillData) => {
    const res = await api.post('/skills', skillData);
    return res.data;
  },
};
