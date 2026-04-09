import api from './api';

export const agileService = {
  // General Agile
  getClassmates: async (groupId) => {
    const res = await api.get(`/agile/students/${groupId}`);
    return res.data;
  },
  getTeams: async (groupId) => {
    const res = await api.get(`/agile/teams/${groupId}`);
    return res.data;
  },
  createTeam: async (data) => {
    const res = await api.post('/agile/teams', data);
    return res.data;
  },
  joinTeam: async (teamId) => {
    const res = await api.post('/agile/teams/join', { team_id: teamId });
    return res.data;
  },
  deleteTeam: async (teamId) => {
    const res = await api.delete(`/agile/teams/${teamId}`);
    return res.data;
  },

  // Sprints
  createSprint: async (data) => {
    const res = await api.post('/sprints', data);
    return res.data;
  },
  getSprintsByGroup: async (groupId) => {
    const res = await api.get(`/sprints/group/${groupId}`);
    return res.data;
  },
  deleteSprint: async (id) => {
    const res = await api.delete(`/sprints/${id}`);
    return res.data;
  },

  // Submissions
  submitSprint: async (sprintId, data) => {
    const res = await api.post(`/sprints/${sprintId}/submit`, data);
    return res.data;
  },
  getTeamSubmissions: async (teamId) => {
    const res = await api.get(`/sprints/sprint-submissions/team/${teamId}`);
    return res.data;
  },
  getSprintSubmissions: async (sprintId) => {
    const res = await api.get(`/sprints/sprint-submissions/sprint/${sprintId}`);
    return res.data;
  }
};
