import api from './client';

export const orgApi = {
  getAllOrgs: async () => {
    const res = await api.get('/organizations');
    return res.data;
  },

  createOrg: async (orgData) => {
    const res = await api.post('/organizations', orgData);
    return res.data;
  },
};
