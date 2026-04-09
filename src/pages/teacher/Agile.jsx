import React, { useState, useEffect } from 'react';
import { Users, Layout, Trash2, Plus, ExternalLink, FileText, Link, X } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { agileService } from '../../services/agileService';
import '../../styles/tables.css';

const TeacherAgile = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Sprint Management State
  const [sprints, setSprints] = useState([]);
  const [showSprintManager, setShowSprintManager] = useState(false);
  const [newSprint, setNewSprint] = useState({ title: '', module_id: '', description: '' });
  const [modules, setModules] = useState([]);

  // Team Submissions State
  const [showTeamSubmissions, setShowTeamSubmissions] = useState(false);
  const [viewingTeam, setViewingTeam] = useState(null);
  const [teamSubmissions, setTeamSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchTeams(selectedGroup);
      fetchSprints(selectedGroup);
      fetchModules();
    }
  }, [selectedGroup]);

  const fetchModules = async () => {
    try {
      const data = await teacherService.getModules();
      setModules(data);
    } catch (e) {
      setModules([{ id: 1, title: 'Web Development' }, { id: 2, title: 'Software Engineering' }]);
    }
  };

  const fetchSprints = async (groupId) => {
    try {
      const data = await agileService.getSprintsByGroup(groupId);
      setSprints(data);
    } catch (e) {
      setSprints([
        { id: 1, title: 'Sprint 1: Architecture', module_title: 'Web Dev', created_at: new Date().toISOString() },
        { id: 2, title: 'Sprint 2: UI Design', module_title: 'Web Dev', created_at: new Date().toISOString() }
      ]);
    }
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    try {
      await agileService.createSprint({ group_id: selectedGroup, ...newSprint });
      setNewSprint({ title: '', module_id: '', description: '' });
      fetchSprints(selectedGroup);
    } catch (e) {
      console.error(e);
      alert('Failed to create sprint.');
    }
  };

  const handleDeleteSprint = async (id) => {
    if(!window.confirm('Are you sure you want to delete this sprint?')) return;
    try {
      await agileService.deleteSprint(id);
      fetchSprints(selectedGroup);
    } catch (e) {
      console.error(e);
      alert('Failed to delete sprint.');
    }
  };

  const handleViewSubmissions = async (team) => {
    setViewingTeam(team);
    setShowTeamSubmissions(true);
    setLoadingSubmissions(true);
    try {
      const data = await agileService.getTeamSubmissions(team.id);
      setTeamSubmissions(data);
    } catch (e) {
      setTeamSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const grpData = await teacherService.getGroups();
      setGroups(grpData);
      if(grpData.length > 0) setSelectedGroup(grpData[0].id);
    } catch (e) {
      setGroups([{ id: 1, name: 'L3 INFO Grp A' }, { id: 2, name: 'M1 CS' }]);
      setSelectedGroup(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async (groupId) => {
    try {
      const data = await agileService.getTeams(groupId);
      setTeams(data);
    } catch (e) {
      setTeams([{ id: 1, name: 'Team Alpha', members: 3, created_at: new Date().toISOString() }]);
    }
  };

  const handleDelete = async (id) => {
    try {
      await agileService.deleteTeam(id);
      fetchTeams(selectedGroup);
    } catch (e) {
      console.error(e);
      alert('Failed to delete Agile team from database.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Agile Teams</h1>
          <p className="page-subtitle">Manage student agile teams and sprints.</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => setShowSprintManager(true)}>
          <Layout size={18} /> Manage Sprints
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <p className="font-semibold text-muted">Select Group:</p>
        <select 
          className="form-input" 
          style={{ width: '300px' }}
          value={selectedGroup || ''} 
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Member Count</th>
              <th>Created Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(loading) ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">Loading teams...</td></tr>
            ) : teams.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">No teams created in this group.</td></tr>
            ) : (
              teams.map(team => (
                <tr key={team.id}>
                  <td className="font-semibold flex items-center gap-2">
                    <Users size={16} className="text-primary-color" />
                    {team.name}
                  </td>
                  <td>{Array.isArray(team.members) ? team.members.length : (team.members || 0)} Students</td>
                  <td>{new Date(team.created_at).toLocaleDateString()}</td>
                  <td className="text-right flex items-center justify-end gap-2">
                    <button className="action-btn flex items-center gap-1" onClick={() => handleViewSubmissions(team)}><Layout size={14}/> Sprints</button>
                    <button className="action-btn danger" onClick={() => handleDelete(team.id)}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sprint Manager Modal */}
      {showSprintManager && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2 className="font-bold">Group Sprints</h2>
              <button className="modal-close" onClick={() => setShowSprintManager(false)}><X size={24} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="font-semibold mb-3">Create New Sprint</h3>
                <form onSubmit={handleCreateSprint}>
                  <div className="form-group mb-3">
                    <label className="form-label">Sprint Title</label>
                    <input 
                      type="text" className="form-input" required 
                      placeholder="e.g. Sprint 1: MVP"
                      value={newSprint.title} 
                      onChange={(e) => setNewSprint({...newSprint, title: e.target.value})} 
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label className="form-label">Module</label>
                    <select 
                      className="form-input" required
                      value={newSprint.module_id}
                      onChange={(e) => setNewSprint({...newSprint, module_id: e.target.value})}
                    >
                      <option value="">Select Module</option>
                      {modules.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group mb-3">
                    <label className="form-label">Description (Optional)</label>
                    <textarea 
                      className="form-input" rows="3"
                      value={newSprint.description}
                      onChange={(e) => setNewSprint({...newSprint, description: e.target.value})}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2">
                    <Plus size={18} /> Create Sprint
                  </button>
                </form>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Existing Sprints</h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {sprints.length === 0 ? (
                    <p className="text-muted text-center py-4">No sprints created for this group.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {sprints.map(s => (
                        <div key={s.id} className="card p-3 flex justify-between items-center bg-light">
                          <div>
                            <div className="font-bold">{s.title}</div>
                            <div className="text-xs text-muted">{s.module_title} • {new Date(s.created_at).toLocaleDateString()}</div>
                          </div>
                          <button className="action-btn danger sm" onClick={() => handleDeleteSprint(s.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Submissions Modal */}
      {showTeamSubmissions && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <div>
                <h2 className="font-bold">Submissions: {viewingTeam?.name}</h2>
                <p className="text-xs text-muted">Tracking progress across all group sprints</p>
              </div>
              <button className="modal-close" onClick={() => setShowTeamSubmissions(false)}><X size={24} /></button>
            </div>
            
            <div className="mt-4">
              {loadingSubmissions ? (
                <div className="text-center py-8">Loading team submissions...</div>
              ) : sprints.length === 0 ? (
                <div className="text-center py-8 text-muted italic">No sprints defined for this group yet.</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Sprint</th>
                      <th className="text-right">Submission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sprints.map(sprint => {
                      const submission = teamSubmissions.find(sub => sub.sprint_id === sprint.id);
                      return (
                        <tr key={sprint.id}>
                          <td>
                            <div className="font-medium text-sm">{sprint.title}</div>
                            <div className="text-xs text-muted">{sprint.module_title}</div>
                          </td>
                          <td className="text-right">
                            {submission ? (
                              <div className="flex items-center justify-end gap-2">
                                {submission.repo && (
                                  <a href={submission.repo} target="_blank" rel="noopener noreferrer" className="action-btn sm" title="Repo">
                                    <Link size={14} />
                                  </a>
                                )}
                                {submission.web_page && (
                                  <a href={submission.web_page} target="_blank" rel="noopener noreferrer" className="action-btn sm" title="Demo">
                                    <ExternalLink size={14} />
                                  </a>
                                )}
                                {submission.pdf_report && (
                                  <a href={submission.pdf_report} target="_blank" rel="noopener noreferrer" className="action-btn sm" title="PDF">
                                    <FileText size={14} />
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs italic text-muted">No submission</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAgile;
