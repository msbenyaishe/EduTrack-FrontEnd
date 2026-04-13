import api from './api';

export const workshopService = {
  // Teacher
  createWorkshop: async (data) => {
    const res = await api.post('/workshops', data);
    return res.data;
  },
  updateWorkshop: async (id, data) => {
    const res = await api.put(`/workshops/${id}`, data);
    return res.data;
  },
  getWorkshopsByGroupAndModule: async (moduleId, groupId) => {
    const res = await api.get(`/workshops/module/${moduleId}/group/${groupId}`);
    return res.data;
  },
  getWorkshopsByGroup: async (groupId) => {
    const res = await api.get(`/workshops/group/${groupId}`);
    return res.data;
  },
  deleteWorkshop: async (id) => {
    const res = await api.delete(`/workshops/${id}`);
    return res.data;
  },
  
  // Student
  getStudentWorkshops: async () => {
    const res = await api.get('/workshops/student');
    return res.data;
  },
  submitWorkshop: async (data) => {
    const { workshop_id, ...rest } = data;
    const res = await api.post(`/workshops/${workshop_id}/submit`, rest);
    return res.data;
  },
  getMySubmissions: async () => {
    const res = await api.get('/workshops/workshop-submissions/my');
    return res.data;
  },

  // Submissions (Teacher)
  getSubmissionsByWorkshop: async (workshopId) => {
    const res = await api.get(`/workshops/workshop-submissions/workshop/${workshopId}`);
    return res.data;
  },
  getSubmissionsByGroup: async (groupId) => {
    const res = await api.get(`/workshops/workshop-submissions/group/${groupId}`);
    return res.data;
  }
};
