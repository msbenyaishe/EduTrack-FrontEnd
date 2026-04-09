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
    const response = await api.post('/auth/register-student', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
