import api from './api';

const cache = new Map();
const DEFAULT_TTL_MS = 30 * 1000;

function withCache(key, fetcher, ttl = DEFAULT_TTL_MS) {
  const now = Date.now();
  const cached = cache.get(key);
  const isFresh = cached && now - cached.ts < ttl;

  if (isFresh) {
    // Refresh cache in background without blocking UI.
    fetcher()
      .then((data) => cache.set(key, { data, ts: Date.now() }))
      .catch(() => {});
    return Promise.resolve(cached.data);
  }

  return fetcher().then((data) => {
    cache.set(key, { data, ts: Date.now() });
    return data;
  });
}

export const teacherService = {
  getDashboardStats: async () => {
    return withCache('teacher:getDashboardStats', async () => {
      // We can fetch groups, modules, submissions concurrently
      const [groupsRes, modulesRes, submissionsRes] = await Promise.all([
        api.get('/groups'),
        api.get('/modules'),
        api.get('/teachers/submissions')
      ]);

      return {
        groupsCount: groupsRes.data.length || 0,
        modulesCount: modulesRes.data.length || 0,
        recentSubmissions: submissionsRes.data || [],
        groups: groupsRes.data || []
      };
    });
  },
  updateSubmissionReaction: async (submissionType, submissionId, reaction) => {
    const res = await api.patch('/teachers/submissions/reaction', {
      submissionType,
      submissionId,
      reaction
    });
    cache.clear();
    return res.data;
  },
  deleteSubmission: async (submissionType, submissionId) => {
    const res = await api.delete('/teachers/submissions', {
      data: { submissionType, submissionId }
    });
    cache.clear();
    return res.data;
  },
  
  // MODULES
  getModules: async () => {
    return withCache('teacher:getModules', async () => {
      const res = await api.get('/modules');
      return res.data;
    });
  },
  createModule: async (data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const res = await api.post('/modules', data, config);
    cache.clear();
    return res.data;
  },
  updateModule: async (id, data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const res = await api.put(`/modules/${id}`, data, config);
    cache.clear();
    return res.data;
  },
  deleteModule: async (id) => {
    const res = await api.delete(`/modules/${id}`);
    cache.clear();
    return res.data;
  },
  
  // GROUPS
  getGroups: async () => {
    return withCache('teacher:getGroups', async () => {
      const res = await api.get('/groups');
      return res.data;
    });
  },
  createGroup: async (data) => {
    const res = await api.post('/groups', data);
    cache.clear();
    return res.data;
  },
  getGroupDetails: async (id) => {
    return withCache(`teacher:getGroupDetails:${id}`, async () => {
      const res = await api.get(`/groups/${id}`);
      return res.data;
    });
  },
  getGroupStudents: async (id) => {
    return withCache(`teacher:getGroupStudents:${id}`, async () => {
      const res = await api.get(`/groups/${id}/students`);
      return res.data;
    });
  },
  generateInviteCode: async (id) => {
    const res = await api.post(`/groups/${id}/generate-code`);
    cache.clear();
    return res.data;
  },
  updateGroup: async (id, data) => {
    const res = await api.put(`/groups/${id}`, data);
    cache.clear();
    return res.data;
  },
  deleteGroup: async (id) => {
    const res = await api.delete(`/groups/${id}`);
    cache.clear();
    return res.data;
  },
  removeStudentFromGroup: async (groupId, studentId) => {
    const res = await api.delete(`/groups/${groupId}/students/${studentId}`);
    cache.clear();
    return res.data;
  },
  assignModuleToGroup: async (data) => {
    const res = await api.post('/modules/assign', data);
    cache.clear();
    return res.data;
  },
  unassignModuleFromGroup: async (moduleId, groupId) => {
    const res = await api.delete(`/modules/assign/${moduleId}/${groupId}`);
    cache.clear();
    return res.data;
  },
  getGroupModules: async (groupId) => {
    return withCache(`teacher:getGroupModules:${groupId}`, async () => {
      const res = await api.get(`/modules?group_id=${groupId}`);
      return res.data;
    });
  }
};
