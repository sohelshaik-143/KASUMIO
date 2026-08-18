import api from './client';

export const studentApi = {
  getProfile: async () => {
    const res = await api.get('/students/profile');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/students/profile', profileData);
    return res.data;
  },

  getDashboard: async () => {
    const res = await api.get('/students/dashboard');
    return res.data;
  },

  getStudentById: async (id) => {
    const res = await api.get(`/students/${id}`);
    return res.data;
  },
};
