import api from './api';

export const studentService = {
  getDashboardStats: async () => {
    const [groupsRes, modulesRes, submissionsRes] = await Promise.all([
      api.get('/groups/student/my-groups'),
      api.get('/students/modules'), // Assuming this returns some counts
      api.get('/students/submissions')
    ]);

    // Create distinct module count based on ID
    const uniqueModules = new Set((modulesRes.data || []).map(m => m.id));

    return {
      groupsCount: groupsRes.data.length || 0,
      modulesCount: uniqueModules.size || 0,
      recentSubmissions: submissionsRes.data || {}
    };
  },
  
  // MODULES
  getModules: async () => {
    const res = await api.get('/students/modules');
    return res.data;
  },

  // GROUPS
  getMyGroups: async () => {
    const res = await api.get('/groups/student/my-groups');
    return res.data;
  },
  joinGroup: async (invite_code) => {
    const res = await api.post('/groups/join', { invite_code });
    return res.data;
  }
};
