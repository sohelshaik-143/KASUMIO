import api from './client';

export const authApi = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/me');
    return res.data;
  },

  uploadAvatar: async (formData) => {
    const res = await api.post('/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteAvatar: async () => {
    const res = await api.delete('/me/avatar');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/me/profile', profileData);
    return res.data;
  },
};
