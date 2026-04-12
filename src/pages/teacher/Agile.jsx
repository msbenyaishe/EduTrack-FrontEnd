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
    } catch {
      setModules([{ id: 1, title: 'Web Development' }, { id: 2, title: 'Software Engineering' }]);
    }
  };

  const fetchSprints = async (groupId) => {
    try {
      const data = await agileService.getSprintsByGroup(groupId);
      setSprints(data);
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
        <button type="button" className="btn btn-primary btn--with-icon" onClick={() => setShowSprintManager(true)}>
          <Layout size={18} /> Manage Sprints
        </button>
      </div>

      <div className="card card--toolbar">
        <label className="card--toolbar__label" htmlFor="agile-group">Select Group:</label>
        <div className="card--toolbar__fields">
          <select
            id="agile-group"
            className="form-input form-input--compact-select"
            value={selectedGroup || ''}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-cards">
        {loading ? (
          <div className="loading-state">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="empty-state-card card">
            <Users size={32} className="empty-state-card__icon" />
            <p>No agile teams created in this group yet.</p>
          </div>
        ) : (
          teams.map(team => (
            <div key={team.id} className="card card--col">
              <div>
                <div className="card__head">
                  <div className="card__title-group">
                    <div className="media-icon media-icon--primary">
                      <Users size={20} />
                    </div>
                    {team.name}
                  </div>
                </div>

                <div className="card__body">
                  <div className="badge badge-primary badge--block">
                    {Array.isArray(team.members) ? team.members.length : (team.members || 0)} Students
                  </div>
                  <div className="card__muted">Created: {new Date(team.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="card__footer">
                <button type="button" className="btn btn-secondary btn--edit-row" onClick={() => handleViewSubmissions(team)}>
                  <Layout size={16} /> View Sprints
                </button>
                <button type="button" className="icon-action-btn icon-action-btn--danger" onClick={() => handleDelete(team.id)} title="Delete team">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showSprintManager && (
        <div className="modal-overlay">
          <div className="modal-content modal-content--wide">
            <div className="modal-header">
              <h2 className="font-bold">Group Sprints</h2>
              <button type="button" className="modal-close" onClick={() => setShowSprintManager(false)} aria-label="Close"><X size={24} /></button>
            </div>

            <div className="two-col-modal">
              <div>
                <h3 className="modal-section-title">Create New Sprint</h3>
                <form onSubmit={handleCreateSprint}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="sprint-title">Sprint Title</label>
                    <input
                      id="sprint-title"
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Sprint 1: MVP"
                      value={newSprint.title}
                      onChange={(e) => setNewSprint({...newSprint, title: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="sprint-module">Module</label>
                    <select
                      id="sprint-module"
                      className="form-input"
                      required
                      value={newSprint.module_id}
                      onChange={(e) => setNewSprint({...newSprint, module_id: e.target.value})}
                    >
                      <option value="">Select Module</option>
                      {modules.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="sprint-desc">Description (Optional)</label>
                    <textarea
                      id="sprint-desc"
                      className="form-input"
                      rows={3}
                      value={newSprint.description}
                      onChange={(e) => setNewSprint({...newSprint, description: e.target.value})}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary btn--block btn--with-icon">
                    <Plus size={18} /> Create Sprint
                  </button>
                </form>
              </div>

              <div>
                <h3 className="modal-section-title">Existing Sprints</h3>
                <div className="scroll-region">
                  {sprints.length === 0 ? (
                    <p className="sprint-empty-hint">No sprints created for this group.</p>
                  ) : (
                    <div className="sprint-list-stack">
                      {sprints.map(s => (
                        <div key={s.id} className="sprint-row">
                          <div>
                            <div className="font-bold">{s.title}</div>
                            <div className="card__muted">{s.module_title} • {new Date(s.created_at).toLocaleDateString()}</div>
                          </div>
                          <button type="button" className="action-btn action-btn--danger action-btn--sm" onClick={() => handleDeleteSprint(s.id)} title="Delete sprint">
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

      {showTeamSubmissions && (
        <div className="modal-overlay">
          <div className="modal-content modal-content--medium">
            <div className="modal-header">
              <div>
                <h2 className="font-bold">Submissions: {viewingTeam?.name}</h2>
                <p className="card__muted">Tracking progress across all group sprints</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setShowTeamSubmissions(false)} aria-label="Close"><X size={24} /></button>
            </div>

            <div className="scroll-region sprint-list-stack scroll-region--mt">
                {loadingSubmissions ? (
                  <p className="sprint-empty-hint">Loading submissions...</p>
                ) : (
                  sprints.map(sprint => {
                  const submission = teamSubmissions.find(sub => sub.sprint_id === sprint.id);
                  return (
                    <div key={sprint.id} className="submission-row">
                      <div>
                        <div className="member-name">{sprint.title}</div>
                        <div className="card__muted">{sprint.module_title}</div>
                      </div>

                      <div className="submission-links">
                        {submission ? (
                          <>
                            {submission.repo && (
                              <a href={submission.repo} target="_blank" rel="noopener noreferrer" className="link-icon-btn" title="Repo">
                                <Link size={18} />
                              </a>
                            )}
                            {submission.web_page && (
                              <a href={submission.web_page} target="_blank" rel="noopener noreferrer" className="link-icon-btn" title="Demo">
                                <ExternalLink size={18} />
                              </a>
                            )}
                            {submission.pdf_report && (
                              <a href={submission.pdf_report} target="_blank" rel="noopener noreferrer" className="link-icon-btn" title="PDF">
                                <FileText size={18} />
                              </a>
                            )}
                          </>
                        ) : (
                          <span className="pill-muted">No submission</span>
                        )}
                      </div>
                    </div>
                  );
                  })
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAgile;
