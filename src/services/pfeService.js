import api from './api';

export const pfeService = {
  getTeams: async (groupId) => {
    const res = await api.get(`/pfe/teams/${groupId}`);
    return res.data;
  },
  createTeam: async (data) => {
    const res = await api.post('/pfe/teams', data);
    return res.data;
  },
  joinTeam: async (teamId) => {
    const res = await api.post('/pfe/teams/join', { team_id: teamId });
    return res.data;
  },
  deleteTeam: async (teamId) => {
    const res = await api.delete(`/pfe/teams/${teamId}`);
    return res.data;
  },
  submitPfe: async (data) => {
    const res = await api.post('/pfe/submit', data);
    return res.data;
  },
  getGroupSubmissions: async (groupId) => {
    const res = await api.get(`/pfe/submissions/${groupId}`);
    return res.data;
  },
  getTeamSubmissions: async (teamId) => {
    const res = await api.get(`/pfe/submissions/team/${teamId}`);
    return res.data;
  }
};
