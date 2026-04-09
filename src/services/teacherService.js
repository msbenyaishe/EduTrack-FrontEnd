import api from './api';

export const teacherService = {
  getDashboardStats: async () => {
    // We can fetch groups, modules, submissions concurrently
    const [groupsRes, modulesRes, submissionsRes] = await Promise.all([
      api.get('/groups'),
      api.get('/modules'),
      api.get('/teachers/submissions')
    ]);

    return {
      groupsCount: groupsRes.data.length || 0,
      modulesCount: modulesRes.data.length || 0,
      recentSubmissions: submissionsRes.data || []
    };
  },
  
  // MODULES
  getModules: async () => {
    const res = await api.get('/modules');
    return res.data;
  },
  createModule: async (data) => {
    const res = await api.post('/modules', data);
    return res.data;
  },
  updateModule: async (id, data) => {
    const res = await api.put(`/modules/${id}`, data);
    return res.data;
  },
  deleteModule: async (id) => {
    const res = await api.delete(`/modules/${id}`);
    return res.data;
  },
  
  // GROUPS
  getGroups: async () => {
    const res = await api.get('/groups');
    return res.data;
  },
  createGroup: async (data) => {
    const res = await api.post('/groups', data);
    return res.data;
  },
  getGroupDetails: async (id) => {
    const res = await api.get(`/groups/${id}`);
    return res.data;
  },
  getGroupStudents: async (id) => {
    const res = await api.get(`/groups/${id}/students`);
    return res.data;
  },
  generateInviteCode: async (id) => {
    const res = await api.post(`/groups/${id}/generate-code`);
    return res.data;
  },
  updateGroup: async (id, data) => {
    const res = await api.put(`/groups/${id}`, data);
    return res.data;
  },
  deleteGroup: async (id) => {
    const res = await api.delete(`/groups/${id}`);
    return res.data;
  }
};
