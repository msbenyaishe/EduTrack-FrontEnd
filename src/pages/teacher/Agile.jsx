import React, { useState, useEffect } from 'react';
import { Users, Layout, Trash2, Plus, ExternalLink, FileText, Link, X, Pencil } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { agileService } from '../../services/agileService';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/locale';
import { formatGroupTitle } from '../../utils/groupFormatters';


const TeacherAgile = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || 'en';
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);
  
  // Sprint Management State
  const [sprints, setSprints] = useState([]);
  const [showSprintManager, setShowSprintManager] = useState(false);
  const [newSprint, setNewSprint] = useState({
    title: '',
    module_id: '',
    description: '',
    pdf_report: '',
    repo: '',
    web_page: '',
  });
  const [editingSprint, setEditingSprint] = useState(null);
  const [editSprintForm, setEditSprintForm] = useState({
    title: '',
    description: '',
    pdf_report: '',
    repo: '',
    web_page: '',
  });
  const [modules, setModules] = useState([]);

  // Team Submissions State
  const [showTeamSubmissions, setShowTeamSubmissions] = useState(false);
  const [viewingTeam, setViewingTeam] = useState(null);
  const [teamSubmissions, setTeamSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [showMembersModal, setShowMembersModal] = useState(false);
  const [membersModalTeam, setMembersModalTeam] = useState(null);
  const formatGroupWithHyphenYear = (group) => formatGroupTitle(group?.name, group?.year).replace(/–/g, '-');

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
      setNewSprint({
        title: '',
        module_id: '',
        description: '',
        pdf_report: '',
        repo: '',
        web_page: '',
      });
      fetchSprints(selectedGroup);
    } catch (e) {
      console.error(e);
      alert(t('teacher.agile.createSprintFailed', { defaultValue: 'Failed to create sprint.' }));
    }
  };

  const handleOpenEditSprint = (sprint) => {
    setEditingSprint(sprint);
    setEditSprintForm({
      title: sprint.title || '',
      description: sprint.description || '',
      pdf_report: sprint.pdf_report || '',
      repo: sprint.repo || '',
      web_page: sprint.web_page || '',
    });
  };

  const handleUpdateSprint = async (e) => {
    e.preventDefault();
    if (!editingSprint) return;
    try {
      await agileService.updateSprint(editingSprint.id, editSprintForm);
      setEditingSprint(null);
      fetchSprints(selectedGroup);
    } catch (error) {
      console.error(error);
      alert(t('teacher.agile.updateSprintFailed', { defaultValue: 'Failed to update sprint.' }));
    }
  };

  const handleDeleteSprint = async (id) => {
    if(!window.confirm(t('teacher.agile.deleteSprintConfirm', { defaultValue: 'Are you sure you want to delete this sprint?' }))) return;
    try {
      await agileService.deleteSprint(id);
      fetchSprints(selectedGroup);
    } catch (e) {
      console.error(e);
      alert(t('teacher.agile.deleteSprintFailed', { defaultValue: 'Failed to delete sprint.' }));
    }
  };

  const handleViewMembers = (team) => {
    setMembersModalTeam(team);
    setShowMembersModal(true);
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
    setLoadingTeams(true);
    try {
      const data = await agileService.getTeams(groupId);
      setTeams(data);
    } catch {
      setTeams([{ id: 1, name: 'Team Alpha', members: 3, created_at: new Date().toISOString() }]);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await agileService.deleteTeam(id);
      fetchTeams(selectedGroup);
    } catch (e) {
      console.error(e);
      alert(t('teacher.agile.deleteTeamFailed', { defaultValue: 'Failed to delete Agile team from database.' }));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('teacher.agile.title', { defaultValue: 'Agile Teams' })}</h1>
          <p className="page-subtitle">{t('teacher.agile.subtitle', { defaultValue: 'Manage student agile teams and sprints.' })}</p>
        </div>
        <button type="button" className="btn btn-primary btn--with-icon" onClick={() => setShowSprintManager(true)}>
          <Layout size={18} /> {t('teacher.agile.manageSprints', { defaultValue: 'Manage Sprints' })}
        </button>
      </div>

      <div className="card card--toolbar">
        <label className="card--toolbar__label" htmlFor="agile-group">{t('teacher.agile.selectGroup', { defaultValue: 'Select Group:' })}</label>
        <div className="card--toolbar__fields">
          <select
            id="agile-group"
            className="form-input form-input--compact-select"
            value={selectedGroup || ''}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            {groups.map(g => (
              <option key={g.id} value={g.id}>{formatGroupWithHyphenYear(g)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-cards">
        {loading || loadingTeams ? (
          <div className="loading-state">{t('teacher.agile.loadingTeams', { defaultValue: 'Loading teams...' })}</div>
        ) : teams.length === 0 ? (
          <div className="empty-state-card card">
            <Users size={32} className="empty-state-card__icon" />
            <p>{t('teacher.agile.emptyTeams', { defaultValue: 'No agile teams created in this group yet.' })}</p>
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
                  <button
                    type="button"
                    className="badge-btn"
                    onClick={() => handleViewMembers(team)}
                  >
                    <Users size={14} />
                    {Array.isArray(team.members) ? team.members.length : (team.members || 0)} {t('teacher.agile.members', { defaultValue: 'Members' })}
                  </button>
                  <div className="card__muted">{t('teacher.agile.created', { defaultValue: 'Created:' })} {formatDate(team.created_at, language)}</div>
                </div>
              </div>

              <div className="card__footer">
                <button type="button" className="btn btn-secondary btn--edit-row" onClick={() => handleViewSubmissions(team)}>
                  <Layout size={16} /> {t('teacher.agile.viewSprints', { defaultValue: 'View Sprints' })}
                </button>
                <button type="button" className="icon-action-btn icon-action-btn--danger" onClick={() => handleDelete(team.id)} title={t('teacher.agile.deleteTeam', { defaultValue: 'Delete team' })}>
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
              <h2 className="font-bold">{t('teacher.agile.groupSprints', { defaultValue: 'Group Sprints' })}</h2>
              <button type="button" className="modal-close" onClick={() => setShowSprintManager(false)} aria-label={t('common.close')}><X size={24} /></button>
            </div>

            <div className="two-col-modal">
              <div>
                <h3 className="modal-section-title">{t('teacher.agile.createNewSprint', { defaultValue: 'Create New Sprint' })}</h3>
                <form onSubmit={handleCreateSprint}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="sprint-title">{t('teacher.agile.sprintTitle', { defaultValue: 'Sprint Title' })}</label>
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
                    <label className="form-label" htmlFor="sprint-module">{t('teacher.agile.module', { defaultValue: 'Module' })}</label>
                    <select
                      id="sprint-module"
                      className="form-input"
                      required
                      value={newSprint.module_id}
                      onChange={(e) => setNewSprint({...newSprint, module_id: e.target.value})}
                    >
                      <option value="">{t('teacher.agile.selectModule', { defaultValue: 'Select Module' })}</option>
                      {modules.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="sprint-desc">{t('teacher.agile.descriptionOptional', { defaultValue: 'Description (Optional)' })}</label>
                    <textarea
                      id="sprint-desc"
                      className="form-input"
                      rows={3}
                      value={newSprint.description}
                      onChange={(e) => setNewSprint({...newSprint, description: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="sprint-pdf">{t('teacher.agile.pdfOptional', { defaultValue: 'PDF Link (Optional)' })}</label>
                    <input
                      id="sprint-pdf"
                      type="url"
                      className="form-input"
                      placeholder="https://..."
                      value={newSprint.pdf_report}
                      onChange={(e) => setNewSprint({ ...newSprint, pdf_report: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="sprint-repo">{t('teacher.agile.repoOptional', { defaultValue: 'Repository Link (Optional)' })}</label>
                    <input
                      id="sprint-repo"
                      type="url"
                      className="form-input"
                      placeholder="https://github.com/..."
                      value={newSprint.repo}
                      onChange={(e) => setNewSprint({ ...newSprint, repo: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="sprint-web">{t('teacher.agile.websiteOptional', { defaultValue: 'Website Link (Optional)' })}</label>
                    <input
                      id="sprint-web"
                      type="url"
                      className="form-input"
                      placeholder="https://..."
                      value={newSprint.web_page}
                      onChange={(e) => setNewSprint({ ...newSprint, web_page: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn--block btn--with-icon">
                    <Plus size={18} /> {t('teacher.agile.createSprint', { defaultValue: 'Create Sprint' })}
                  </button>
                </form>
              </div>

              <div>
                <h3 className="modal-section-title">{t('teacher.agile.existingSprints', { defaultValue: 'Existing Sprints' })}</h3>
                <div className="scroll-region">
                  {sprints.length === 0 ? (
                    <p className="sprint-empty-hint">{t('teacher.agile.noSprints', { defaultValue: 'No sprints created for this group.' })}</p>
                  ) : (
                    <div className="sprint-list-stack">
                      {sprints.map(s => (
                        <div key={s.id} className="sprint-row">
                          <div>
                            <div className="font-bold">{s.title}</div>
                            <div className="card__muted">{s.module_title} • {new Date(s.created_at).toLocaleDateString()}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              type="button"
                              className="action-btn action-btn--sm"
                              onClick={() => handleOpenEditSprint(s)}
                              title={t('teacher.agile.editSprint', { defaultValue: 'Edit sprint' })}
                            >
                              <Pencil size={14} />
                            </button>
                            <button type="button" className="action-btn action-btn--danger action-btn--sm" onClick={() => handleDeleteSprint(s.id)} title={t('teacher.agile.deleteSprint', { defaultValue: 'Delete sprint' })}>
                              <Trash2 size={14} />
                            </button>
                          </div>
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

      {editingSprint && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">{t('teacher.agile.editSprint', { defaultValue: 'Edit Sprint' })}</h2>
              <button type="button" className="modal-close" onClick={() => setEditingSprint(null)} aria-label={t('common.close')}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateSprint}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-sprint-title">{t('teacher.agile.sprintTitle', { defaultValue: 'Sprint Title' })}</label>
                <input
                  id="edit-sprint-title"
                  type="text"
                  className="form-input"
                  value={editSprintForm.title}
                  onChange={(e) => setEditSprintForm({ ...editSprintForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-sprint-desc">{t('teacher.agile.descriptionOptional', { defaultValue: 'Description (Optional)' })}</label>
                <textarea
                  id="edit-sprint-desc"
                  className="form-input"
                  rows={3}
                  value={editSprintForm.description}
                  onChange={(e) => setEditSprintForm({ ...editSprintForm, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-sprint-pdf">{t('teacher.agile.pdfOptional', { defaultValue: 'PDF Link (Optional)' })}</label>
                <input
                  id="edit-sprint-pdf"
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={editSprintForm.pdf_report}
                  onChange={(e) => setEditSprintForm({ ...editSprintForm, pdf_report: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-sprint-repo">{t('teacher.agile.repoOptional', { defaultValue: 'Repository Link (Optional)' })}</label>
                <input
                  id="edit-sprint-repo"
                  type="url"
                  className="form-input"
                  placeholder="https://github.com/..."
                  value={editSprintForm.repo}
                  onChange={(e) => setEditSprintForm({ ...editSprintForm, repo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-sprint-web">{t('teacher.agile.websiteOptional', { defaultValue: 'Website Link (Optional)' })}</label>
                <input
                  id="edit-sprint-web"
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={editSprintForm.web_page}
                  onChange={(e) => setEditSprintForm({ ...editSprintForm, web_page: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingSprint(null)}>
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('common.save', { defaultValue: 'Save' })}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMembersModal && membersModalTeam && (
        <div className="modal-overlay">
          <div className="modal-content modal-content--narrow">
            <div className="modal-header">
              <h2 className="font-bold modal-title-row">
                {membersModalTeam.name} Members
              </h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowMembersModal(false)}
                aria-label={t('common.close')}
              >
                <X size={24} />
              </button>
            </div>

            <div className="member-list-stack scroll-region--sm">
              {Array.isArray(membersModalTeam.members) && membersModalTeam.members.length > 0 ? (
                membersModalTeam.members.map((member, idx) => (
                  <div key={member.id ?? idx} className="member-line">
                    <div className="member-line__left">
                      <div className="member-avatar member-avatar--sm">
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="member-line__name">{member.name}</div>
                        <div className="card__muted">{member.email}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-italic-muted padded-y-muted">
                  {Array.isArray(membersModalTeam.members) && membersModalTeam.members.length === 0
                    ? 'No students in this team yet.'
                    : 'Member names are not available for this team. The list will appear once the server returns a members array on each team.'}
                </div>
              )}
            </div>

            <div className="modal-footer modal-footer--stack modal-footer--mt">
              <button
                type="button"
                className="btn btn-secondary btn--block"
                onClick={() => setShowMembersModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showTeamSubmissions && (
        <div className="modal-overlay">
          <div className="modal-content modal-content--medium">
            <div className="modal-header">
              <div>
                <h2 className="font-bold">{t('teacher.agile.submissionsFor', { defaultValue: 'Submissions: {{team}}', team: viewingTeam?.name })}</h2>
                <p className="card__muted">{t('teacher.agile.trackingProgress', { defaultValue: 'Tracking progress across all group sprints' })}</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setShowTeamSubmissions(false)} aria-label={t('common.close')}><X size={24} /></button>
            </div>

            <div className="scroll-region sprint-list-stack scroll-region--mt">
                {loadingSubmissions ? (
                  <p className="sprint-empty-hint">{t('teacher.agile.loadingSubmissions', { defaultValue: 'Loading submissions...' })}</p>
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
                              <a href={submission.repo} target="_blank" rel="noopener noreferrer" className="link-icon-btn" title={t('teacher.agile.repo', { defaultValue: 'Repo' })}>
                                <Link size={18} />
                              </a>
                            )}
                            {submission.web_page && (
                              <a href={submission.web_page} target="_blank" rel="noopener noreferrer" className="link-icon-btn" title={t('teacher.agile.demo', { defaultValue: 'Demo' })}>
                                <ExternalLink size={18} />
                              </a>
                            )}
                            {submission.pdf_report && (
                              <a href={submission.pdf_report} target="_blank" rel="noopener noreferrer" className="link-icon-btn" title={t('teacher.agile.pdf', { defaultValue: 'PDF' })}>
                                <FileText size={18} />
                              </a>
                            )}
                          </>
                        ) : (
                          <span className="pill-muted">{t('teacher.agile.noSubmission', { defaultValue: 'No submission' })}</span>
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
