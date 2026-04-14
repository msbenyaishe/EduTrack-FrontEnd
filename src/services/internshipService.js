import api from './api';

export const internshipService = {
  getStudentInternships: async () => {
    const res = await api.get('/internships/me');
    return res.data;
  },
  submitInternship: async (data) => {
    const res = await api.post('/internships', data);
    return res.data;
  },
  updateInternship: async (id, data) => {
    const res = await api.put(`/internships/${id}`, data);
    return res.data;
  },
  deleteInternship: async (id) => {
    const res = await api.delete(`/internships/${id}`);
    return res.data;
  },
  getGroupInternships: async (groupId) => {
    const res = await api.get(`/internships/group/${groupId}`);
    return res.data;
  }
};
