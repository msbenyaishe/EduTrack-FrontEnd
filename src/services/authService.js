import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  registerTeacher: async (data) => {
    const response = await api.post('/auth/register-teacher', data);
    return response.data;
  },

  registerStudent: async (data) => {
    const config = {};
    if (data instanceof FormData) {
      // Setting Content-Type to null/undefined overrides the default application/json 
      // and lets Axios handle the multipart/form-data boundary automatically.
      config.headers = { 'Content-Type': null };
    }
    const response = await api.post('/auth/register-student', data, config);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    if (data instanceof FormData) {
      config.headers = { 'Content-Type': null };
    }
    const response = await api.put('/auth/profile', data, config);
    return response.data;
  },

  updatePassword: async (data) => {
    const response = await api.put('/auth/password', data);
    return response.data;
  }
};
