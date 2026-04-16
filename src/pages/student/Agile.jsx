import React, { useState, useEffect } from 'react';
import { Users, Plus, Layout, CheckCircle, Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { agileService } from '../../services/agileService';
import { studentService } from '../../services/studentService';
import { useTranslation } from 'react-i18next';


const StudentAgile = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const { user } = useAuth();
  
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState('');

  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [userInTeam, setUserInTeam] = useState(false);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [teamToRename, setTeamToRename] = useState(null); // { id, name }
  const [newTeamName, setNewTeamName] = useState('');

  const [showMembersModal, setShowMembersModal] = useState(false);
  const [teamMembersList, setTeamMembersList] = useState([]);
  const [viewingTeamName, setViewingTeamName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [isUserTeamMember, setIsUserTeamMember] = useState(false);

  // Sprint Submission State
  const [showSprintsModal, setShowSprintsModal] = useState(false);
  const [groupSprints, setGroupSprints] = useState([]);
  const [teamSubmissions, setTeamSubmissions] = useState([]);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({
    sprintId: null,
    repo: '',
    web_page: '',
    pdf_report: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const groups = await studentService.getMyGroups();
      if (groups.length > 0) {
        const firstGroupId = groups[0].id;
        setSelectedGroupId(firstGroupId);
        await fetchTeams(firstGroupId);
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const fetchTeams = async (groupId) => {
    try {
      const data = await agileService.getTeams(groupId || selectedGroupId);
      setTeams(data);
      // Check if user is in any team
      const inTeam = data.some(t => t.members?.some(m => Number(m.id) === Number(user?.id)));
      setUserInTeam(inTeam);
    } catch (e) {
      console.error(e);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedGroupId) {
      alert(t('student.agile.needGroup', { defaultValue: 'You need to be in a group to create a team.' }));
      return;
    }
    if (userInTeam) {
      alert(t('student.agile.alreadyInTeamGroup', { defaultValue: 'You are already a member of an Agile team in this group.' }));
      return;
    }
    try {
      await agileService.createTeam({ group_id: selectedGroupId, name: teamName });
      setShowCreate(false);
      setTeamName('');
      fetchTeams(selectedGroupId);
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.message || e.response?.data?.error || t('student.agile.createFailed', { defaultValue: 'Failed to create team.' });
      alert(errorMsg);
    }
  };

  const handleJoin = async (id) => {
    if (userInTeam) {
      alert(t('student.agile.alreadyInTeamGroup', { defaultValue: 'You are already a member of an Agile team in this group.' }));
      return;
    }
    try {
      await agileService.joinTeam(id);
      alert(t('student.agile.joinedSuccess', { defaultValue: 'Joined Team Successfully!' }));
      fetchTeams(selectedGroupId);
    } catch (e) {
      if (e.response && e.response.status === 409) {
        alert(t('student.agile.alreadyInTeam', { defaultValue: 'You are already a member of this team!' }));
      } else {
        console.error(e);
        const errorMsg = e.response?.data?.message || t('student.agile.joinFailed', { defaultValue: 'Failed to join team.' });
        alert(errorMsg);
      }
    }
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm(t('student.agile.deleteConfirm', { defaultValue: 'Are you sure you want to delete this team? This action cannot be undone.' }))) return;
    try {
      await agileService.deleteTeam(teamId);
      alert(t('student.agile.deletedSuccess', { defaultValue: 'Team deleted successfully.' }));
      fetchTeams(selectedGroupId);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || t('student.agile.deleteFailed', { defaultValue: 'Failed to delete team.' }));
    }
  };

  const handleRenameClick = (team) => {
    setTeamToRename(team);
    setNewTeamName(team.name);
    setShowRenameModal(true);
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!newTeamName || newTeamName === teamToRename.name) {
      setShowRenameModal(false);
      return;
    }
    try {
      await agileService.updateTeam(teamToRename.id, newTeamName);
      setShowRenameModal(false);
      fetchTeams(selectedGroupId);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || t('student.agile.renameFailed', { defaultValue: 'Failed to rename team.' }));
    }
  };

  const handleViewMembers = async (team) => {
    setSelectedTeam(team);
    setTeamMembersList(team.members || []);
    setViewingTeamName(team.name);
    
    const isMember = team.members?.some(m => Number(m.id) === Number(user?.id)) || user?.role === 'teacher';
    setIsUserTeamMember(isMember);
    
    if (isMember) {
      try {
        const classmates = await agileService.getClassmates(selectedGroupId);
        // Filter out students already in ANY team
        const allMemberIds = new Set();
        teams.forEach(t => t.members?.forEach(m => allMemberIds.add(Number(m.id))));
        
        const freeStudents = classmates.filter(c => !allMemberIds.has(Number(c.id)));
        setAvailableStudents(freeStudents);
      } catch (e) {
        console.error("Failed to fetch classmates:", e);
      }
    }
    
    setShowMembersModal(true);
  };

  const handleAddMember = async (studentId) => {
    try {
      await agileService.addMember(selectedTeam.id, studentId);
      // Refresh
      const updatedTeams = await agileService.getTeams(selectedGroupId);
      setTeams(updatedTeams);
      const thisTeam = updatedTeams.find(t => t.id === selectedTeam.id);
      setTeamMembersList(thisTeam.members || []);
      // Update available students
      setAvailableStudents(prev => prev.filter(s => Number(s.id) !== Number(studentId)));
    } catch (e) {
      alert(e.response?.data?.message || t('student.agile.addMemberFailed', { defaultValue: 'Failed to add member.' }));
    }
  };

  const handleRemoveMember = async (studentId) => {
    if (!window.confirm(t('student.agile.removeMemberConfirm', { defaultValue: 'Are you sure you want to remove this member?' }))) return;
    try {
      await agileService.removeMember(selectedTeam.id, studentId);
      // Refresh
      const updatedTeams = await agileService.getTeams(selectedGroupId);
      setTeams(updatedTeams);
      const thisTeam = updatedTeams.find(t => t.id === selectedTeam.id);
      setTeamMembersList(thisTeam.members || []);
      // Fetch classmates again to update available list if needed
      if (isUserTeamMember) {
        const classmates = await agileService.getClassmates(selectedGroupId);
        const allMemberIds = new Set();
        updatedTeams.forEach(t => t.members?.forEach(m => allMemberIds.add(Number(m.id))));
        setAvailableStudents(classmates.filter(c => !allMemberIds.has(Number(c.id))));
      }
    } catch (e) {
      alert(e.response?.data?.message || t('student.agile.removeMemberFailed', { defaultValue: 'Failed to remove member.' }));
    }
  };

  const handleViewSprints = async (team) => {
    setSelectedTeam(team);
    setShowSprintsModal(true);
    setLoadingSprints(true);
    try {
      const sprintsData = await agileService.getSprintsByGroup(selectedGroupId);
      setGroupSprints(sprintsData);
      const subsData = await agileService.getTeamSubmissions(team.id);
      setTeamSubmissions(subsData);
    } catch (e) {
      console.error("Failed to fetch sprints/submissions:", e);
    } finally {
      setLoadingSprints(false);
    }
  };

  const handleSubmissionChange = (field, value) => {
    setSubmissionForm(prev => ({ ...prev, [field]: value }));
  };

  const openSprintSubmissionForm = (sprint, submission) => {
    setSubmissionForm({
      sprintId: sprint.id,
      repo: submission?.repo || '',
      web_page: submission?.web_page || '',
      pdf_report: submission?.pdf_report || ''
    });
  };

  const handleSubmitSprint = async (e) => {
    e.preventDefault();
    try {
      const response = await agileService.submitSprint(submissionForm.sprintId, {
        agile_team_id: selectedTeam.id,
        repo: submissionForm.repo,
        web_page: submissionForm.web_page,
        pdf_report: submissionForm.pdf_report
      });
      alert(response.message || t('student.agile.sprintSubmitted', { defaultValue: 'Sprint submitted successfully!' }));
      // Reset and refresh
      setSubmissionForm({ sprintId: null, repo: '', web_page: '', pdf_report: '' });
      const subsData = await agileService.getTeamSubmissions(selectedTeam.id);
      setTeamSubmissions(subsData);
    } catch (e) {
      alert(e.response?.data?.message || t('student.agile.submitSprintFailed', { defaultValue: 'Failed to submit sprint.' }));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('student.agile.title', { defaultValue: 'Agile Teams' })}</h1>
          <p className="page-subtitle">{t('student.agile.subtitle', { defaultValue: 'Join or create a team to submit sprints.' })}</p>
        </div>
        {!userInTeam && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={18} /> {t('student.agile.createTeam', { defaultValue: 'Create Team' })}
          </button>
        )}
      </div>

      <div className="grid-cards">
        {loading ? (
          <div className="loading-state grid-cards__full">{t('student.agile.loadingTeams', { defaultValue: 'Loading teams...' })}</div>
        ) : teams.length === 0 ? (
          <div className="empty-state-card card grid-cards__full">
            <Layout size={48} className="empty-state-card__icon" />
            <h3 className="empty-state-card__title">{t('student.agile.emptyTitle', { defaultValue: 'No Teams Found' })}</h3>
            <p>{t('student.agile.emptyText', { defaultValue: 'There are no Agile teams in this group yet. Create your team to get started.' })}</p>
            {!userInTeam && (
              <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}>
                <Plus size={18} /> {t('student.agile.createNewTeam', { defaultValue: 'Create New Team' })}
              </button>
            )}
          </div>
        ) : (
          teams.map((team) => {
            const isMember = team.members?.some((m) => Number(m.id) === Number(user?.id));
            return (
              <div key={team.id} className="card card--col">
                <div>
                  <div className="card__head">
                    <div className="card__title-group">
                      <div className="media-icon media-icon--primary">
                        <Users size={20} />
                      </div>
                      <span>{team.name}</span>
                    </div>
                    {isMember ? (
                      <span className="badge badge-success badge--trailing">
                        <CheckCircle size={14} />
                        <span>{t('student.agile.myTeam', { defaultValue: 'My Team' })}</span>
                      </span>
                    ) : null}
                  </div>

                  <div className="card__body">
                    <button
                      type="button"
                      className="badge-btn"
                      onClick={() => handleViewMembers(team)}
                    >
                      <Users size={14} />
                      {team.members?.length || 0} Members
                    </button>
                  </div>
                </div>

                <div className="card__footer card__footer--stack">
                  {isMember ? (
                    <div className="agile-team-card__toolbar">
                      <button
                        type="button"
                        className="icon-action-btn"
                        onClick={() => handleRenameClick(team)}
                        title={t('student.agile.renameTeam', { defaultValue: 'Rename Team' })}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        type="button"
                        className="icon-action-btn"
                        onClick={() => handleViewSprints(team)}
                        title={t('student.agile.viewSprints', { defaultValue: 'View Sprints' })}
                      >
                        <Layout size={18} />
                      </button>
                      <button
                        type="button"
                        className="icon-action-btn icon-action-btn--danger"
                        onClick={() => handleDelete(team.id)}
                        title={t('student.agile.deleteTeam', { defaultValue: 'Delete Team' })}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary btn--block"
                      onClick={() => handleJoin(team.id)}
                      disabled={userInTeam}
                    >
                      {t('student.agile.joinTeam', { defaultValue: 'Join Team' })}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showCreate && (
         <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">{t('student.agile.createNewTeam', { defaultValue: 'Create New Team' })}</h2>
              <button type="button" className="modal-close" onClick={() => setShowCreate(false)} aria-label={t('common.close')}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-team-name">{t('student.agile.teamName', { defaultValue: 'Team Name' })}</label>
                <input id="new-team-name" type="text" className="form-input" required value={teamName} onChange={(e) => setTeamName(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>{t('student.agile.cancel', { defaultValue: 'Cancel' })}</button>
                <button type="submit" className="btn btn-primary">{t('student.agile.create', { defaultValue: 'Create' })}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showRenameModal && (
         <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">{t('student.agile.renameTeam', { defaultValue: 'Rename Team' })}</h2>
              <button type="button" className="modal-close" onClick={() => setShowRenameModal(false)} aria-label={t('common.close')}><X size={20} /></button>
            </div>

            <form onSubmit={handleRenameSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="rename-team">{t('student.agile.newTeamName', { defaultValue: 'New Team Name' })}</label>
                <input
                  id="rename-team"
                  type="text"
                  className="form-input"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRenameModal(false)}>{t('student.agile.cancel', { defaultValue: 'Cancel' })}</button>
                <button type="submit" className="btn btn-primary">{t('student.agile.saveChanges', { defaultValue: 'Save Changes' })}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showMembersModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-content--narrow">
            <div className="modal-header">
              <h2 className="font-bold modal-title-row">
                {viewingTeamName} Members
              </h2>
              <button type="button" className="modal-close" onClick={() => setShowMembersModal(false)} aria-label={t('common.close')}><X size={20} /></button>
            </div>

            <div className="member-list-stack scroll-region--sm">
              {teamMembersList.length > 0 ? (
                teamMembersList.map((member, idx) => (
                  <div key={member.id || idx} className="member-line">
                    <div className="member-line__left">
                      <div className="member-avatar member-avatar--sm">
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="member-line__info">
                        <div className="member-line__name">{member.name}</div>
                        <div className="card__muted">{member.email}</div>
                      </div>
                    </div>
                    {isUserTeamMember && Number(member.id) !== Number(user?.id) && (
                      <button
                        type="button"
                        className="btn-icon-danger"
                        onClick={() => handleRemoveMember(member.id)}
                        title={t('student.agile.removeMember', { defaultValue: 'Remove Member' })}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-italic-muted padded-y-muted">{t('student.agile.noMembers', { defaultValue: 'No members in this team yet.' })}</div>
              )}
            </div>

            {isUserTeamMember && availableStudents.length > 0 && (
              <div className="add-member-block">
                <label className="label-caps" htmlFor="add-member-select">{t('student.agile.addMember', { defaultValue: 'Add Member' })}</label>
                <select
                  id="add-member-select"
                  className="form-input form-input--compact-select"
                  onChange={(e) => {
                    if (e.target.value) handleAddMember(e.target.value);
                    e.target.value = "";
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>{t('student.agile.selectClassmate', { defaultValue: 'Select a classmate...' })}</option>
                  {availableStudents.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="modal-footer modal-footer--stack modal-footer--mt">
              <button type="button" className="btn btn-secondary btn--block" onClick={() => setShowMembersModal(false)}>{t('common.close')}</button>
            </div>
          </div>
        </div>
      )}

      {showSprintsModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-content--wide">
            <div className="modal-header">
              <h2 className="font-bold modal-title-row modal-title-row--muted">
                Team Sprints: {selectedTeam?.name}
              </h2>
              <button type="button" className="modal-close" onClick={() => {
                setShowSprintsModal(false);
                setSubmissionForm({ sprintId: null, repo: '', web_page: '', pdf_report: '' });
              }} aria-label={t('common.close')}><X size={20} /></button>
            </div>

            <div className="scroll-region--mt">
              {loadingSprints ? (
                <div className="loading-state">{t('student.agile.loadingSprints', { defaultValue: 'Loading sprints...' })}</div>
              ) : groupSprints.length === 0 ? (
                <div className="empty-modal-message">{t('student.agile.noSprintsDefined', { defaultValue: 'No sprints have been defined for this group yet.' })}</div>
              ) : (
                <div className="sprint-layout">
                  <div className="sprint-list-panel">
                    <h3 className="sprint-list-panel__title">{t('student.agile.availableSprints', { defaultValue: 'Available Sprints' })}</h3>
                    {groupSprints.map(sprint => {
                      const submission = teamSubmissions.find(sub => sub.sprint_id === sprint.id);
                      const isSelected = submissionForm.sprintId === sprint.id;

                      const choiceClass = submission
                        ? 'sprint-choice sprint-choice--done'
                        : isSelected
                          ? 'sprint-choice sprint-choice--selected'
                          : 'sprint-choice sprint-choice--default';

                      return (
                        <div
                          key={sprint.id}
                          className={choiceClass}
                          onClick={() => openSprintSubmissionForm(sprint, submission)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              openSprintSubmissionForm(sprint, submission);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="sprint-choice__head">
                            <div>
                              <div className="sprint-choice__title">{sprint.title}</div>
                              <div className="card__muted">{sprint.module_title}</div>
                            </div>
                            {submission ? (
                              <span className="badge badge-success badge--tiny">{t('student.agile.submitted', { defaultValue: 'Submitted' })}</span>
                            ) : (
                              <span className="badge badge-primary badge--tiny">{t('student.agile.pending', { defaultValue: 'Pending' })}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="sprint-form-panel">
                    <h3 className="sprint-form-panel__title">
                      {submissionForm.sprintId ? 'Submit Sprint' : 'Select a sprint'}
                    </h3>

                      {submissionForm.sprintId ? (
                      <form className="form-compact" onSubmit={handleSubmitSprint}>
                          {teamSubmissions.some(sub => sub.sprint_id === submissionForm.sprintId) && (
                            <div className="status-banner">{t('student.agile.editingExistingSubmission', { defaultValue: 'Editing existing submission' })}</div>
                          )}
                        <div className="form-group">
                          <label className="form-label" htmlFor="sprint-repo">{t('student.agile.repositoryLink', { defaultValue: 'Repository Link' })}</label>
                          <input
                            id="sprint-repo"
                            type="url"
                            className="form-input"
                            placeholder="https://github.com/..."
                            value={submissionForm.repo}
                            onChange={(e) => handleSubmissionChange('repo', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="sprint-demo">{t('student.agile.liveDemoLink', { defaultValue: 'Live Demo Link' })}</label>
                          <input
                            id="sprint-demo"
                            type="url"
                            className="form-input"
                            placeholder="https://app-demo.com"
                            value={submissionForm.web_page}
                            onChange={(e) => handleSubmissionChange('web_page', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="sprint-pdf">{t('student.agile.pdfReportLink', { defaultValue: 'PDF Report Link / URL' })}</label>
                          <input
                            id="sprint-pdf"
                            type="text"
                            className="form-input"
                            placeholder="Google Drive / Dropbox Link"
                            required
                            value={submissionForm.pdf_report}
                            onChange={(e) => handleSubmissionChange('pdf_report', e.target.value)}
                          />
                        </div>
                        <div className="form-actions-tight">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setSubmissionForm({ sprintId: null, repo: '', web_page: '', pdf_report: '' })}
                          >
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-primary">
                            {teamSubmissions.some(sub => sub.sprint_id === submissionForm.sprintId) ? 'Save Changes' : 'Submit Work'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="sprint-placeholder">
                        <Layout size={32} className="sprint-placeholder__icon" />
                        <p className="card__muted">{t('student.agile.selectPendingSprint', { defaultValue: 'Select a pending sprint from the list to start your submission.' })}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer modal-footer--stack modal-footer--mt">
              <button type="button" className="btn btn-secondary btn--block" onClick={() => setShowSprintsModal(false)}>{t('student.agile.closeWindow', { defaultValue: 'Close Window' })}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAgile;
