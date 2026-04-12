import api from './api';

/** Resolve when the student joined the group (API shape varies). */
function pickStudentJoinedAt(g) {
  if (!g || typeof g !== 'object') return null;
  const v =
    g.joined_at ??
    g.joinedAt ??
    g.member_joined_at ??
    g.memberJoinedAt ??
    g.enrolled_at ??
    g.enrolledAt ??
    g.pivot?.joined_at ??
    g.group_student?.joined_at ??
    g.student_group?.joined_at ??
    g.membership?.joined_at;
  if (v != null && v !== '') return v;
  return null;
}

export const studentService = {
  getDashboardStats: async () => {
    const [groupsRes, modulesRes, submissionsRes] = await Promise.all([
      api.get('/groups/student/my-groups'),
      api.get('/students/modules'), // Assuming this returns some counts
      api.get('/students/submissions')
    ]);

    const groupsRaw = groupsRes.data;
    const groupsArr = Array.isArray(groupsRaw) ? groupsRaw : groupsRaw?.groups ?? [];

    // Create distinct module count based on ID
    const uniqueModules = new Set((modulesRes.data || []).map(m => m.id));

    return {
      groupsCount: groupsArr.length || 0,
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
    const raw = res.data;
    const rows = Array.isArray(raw) ? raw : raw?.groups ?? [];
    return rows.map((g) => ({
      ...g,
      joined_at: pickStudentJoinedAt(g),
    }));
  },
  joinGroup: async (invite_code) => {
    const res = await api.post('/groups/join', { invite_code });
    return res.data;
  }
};
