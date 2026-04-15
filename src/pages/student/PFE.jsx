import React, { useState, useEffect } from 'react';
import { GraduationCap, ExternalLink, Plus, Upload, X, Video, FileText, Trash2, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { pfeService } from '../../services/pfeService';
import { agileService } from '../../services/agileService';
import { Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const StudentPFE = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({ pfe_team_id: '', project_title: '', description: '', project_repo: '', project_demo: '', explanation_video: '', report_pdf: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [existingSubmission, setExistingSubmission] = useState(null);

  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [membersModalTeam, setMembersModalTeam] = useState(null);

  // Renaming State
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [teamToRename, setTeamToRename] = useState(null); // { id, name }
  const [newRenameName, setNewRenameName] = useState('');

  // Member Management State
  const [availableStudents, setAvailableStudents] = useState([]);
  const [isAddingMember, setIsAddingMember] = useState(false);

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
      const data = await pfeService.getTeams(groupId || selectedGroupId);
      setTeams(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, pfe_team_id: data[0].id }));
      }
    } catch (e) {
      console.error(e);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!selectedGroupId) {
      alert(t('student.pfe.needGroup', { defaultValue: 'You need to be in a group to create a team.' }));
      return;
    }
    // Check if user is already in a team for this group
    const inTeam = teams.some(t => t.members?.some(m => Number(m.id) === Number(user?.id)));
    if (inTeam) {
      alert(t('student.pfe.alreadyInGroupTeam', { defaultValue: 'You are already a member of a PFE team in this group.' }));
      return;
    }
    try {
      await pfeService.createTeam({ group_id: selectedGroupId, name: newTeamName });
      setShowCreateTeam(false);
      setNewTeamName('');
      fetchTeams(selectedGroupId);
    } catch {
      alert(t('student.pfe.createTeamFailed', { defaultValue: 'Failed to create PFE team.' }));
    }
  };

  const handleJoin = async (id) => {
    try {
      await pfeService.joinTeam(id);
      alert(t('student.pfe.joinSuccess', { defaultValue: 'Joined PFE Team Successfully!' }));
      fetchTeams(selectedGroupId);
    } catch (e) {
      if (e.response && e.response.status === 409) {
        alert(t('student.pfe.alreadyInTeam', { defaultValue: 'You are already a member of this team!' }));
      } else {
        alert(t('student.pfe.joinFailed', { defaultValue: 'Failed to join team in database.' }));
      }
    }
  };

  const isTeamMember = (team) => {
    const userId = Number(user?.id);
    return team?.members?.some(m => Number(m.id) === userId);
  };

  const isTeamCreator = (team) => {
    const userId = Number(user?.id);
    return (
      Number(team?.created_by) === userId ||
      Number(team?.createdBy) === userId ||
      Number(team?.owner_id) === userId ||
      Number(team?.ownerId) === userId ||
      Number(team?.creator_id) === userId ||
      Number(team?.creatorId) === userId ||
      team?.is_creator === true ||
      team?.isCreator === true ||
      isTeamMember(team) // Standard Agile logic: any member can manage
    );
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm(t('student.pfe.deleteConfirm', { defaultValue: 'Are you sure you want to delete this PFE team? This action cannot be undone.' }))) return;
    try {
      await pfeService.deleteTeam(teamId);
      alert(t('student.pfe.deleted', { defaultValue: 'PFE team deleted successfully.' }));
      fetchTeams(selectedGroupId);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || t('student.pfe.deleteFailed', { defaultValue: 'Failed to delete PFE team.' }));
    }
  };

  const handleOpenSubmissionModal = async () => {
    if (!formData.pfe_team_id) {
      alert(t('student.pfe.joinOrCreateFirst', { defaultValue: 'Please join or create a team first!' }));
      return;
    }

    try {
      const existing = await pfeService.getTeamSubmissions(formData.pfe_team_id);
      const current = Array.isArray(existing) ? existing[0] : existing;

      if (current) {
        setExistingSubmission(current);
        setFormData(prev => ({
          ...prev,
          project_title: current.project_title || '',
          description: current.description || '',
          project_repo: current.project_repo || '',
          project_demo: current.project_demo || '',
          explanation_video: current.explanation_video || '',
          report_pdf: current.report_pdf || ''
        }));
      } else {
        setExistingSubmission(null);
      }
    } catch (e) {
      console.error('Failed to fetch existing PFE submission:', e);
      setExistingSubmission(null);
    }

    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pfe_team_id) {
      alert(t('student.pfe.joinOrCreateFirst', { defaultValue: 'Please join or create a team first!' }));
      return;
    }
    setSubmitting(true);
    try {
      await pfeService.submitPfe(formData);
      setShowModal(false);
      setExistingSubmission(null);
      setFormData(prev => ({ ...prev, project_title: '', description: '', project_repo: '', project_demo: '', explanation_video: '', report_pdf: '' }));
      alert(t('student.pfe.submitted', { defaultValue: 'PFE submitted to database!' }));
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || t('student.pfe.submitFailed', { defaultValue: 'Failed to submit to DB.' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenRename = (team) => {
    setTeamToRename(team);
    setNewRenameName(team.name || '');
    setShowRenameModal(true);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!newRenameName.trim()) return;
    try {
      await pfeService.updateTeam(teamToRename.id, { name: newRenameName });
      setShowRenameModal(false);
      fetchTeams(selectedGroupId);
      alert(t('student.pfe.renamed', { defaultValue: 'Team renamed successfully.' }));
    } catch (e) {
      alert(e.response?.data?.message || t('student.pfe.renameFailed', { defaultValue: 'Failed to rename team.' }));
    }
  };

  const handleViewMembers = async (team) => {
    setMembersModalTeam(team);
    setShowMembersModal(true);
    if (isTeamMember(team)) {
      fetchAvailableStudents(team);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const allStudents = await agileService.getClassmates(selectedGroupId);
      // Filter out students who are already in a PFE team for this group
      // This is a bit complex as we don't have a "getAvailable" endpoint
      // So we'll just show classmates and the backend will validate if they are in a team.
      // But let's try to filter based on our local 'teams' state.
      const studentIdsInTeams = teams.flatMap(t => t.members?.map(m => m.id) || []);
      const available = allStudents.filter(s => !studentIdsInTeams.includes(s.id));
      setAvailableStudents(available);
    } catch (e) {
      console.error('Failed to fetch classmates:', e);
    }
  };

  const handleAddMember = async (studentId) => {
    if (!membersModalTeam) return;
    setIsAddingMember(true);
    try {
      await pfeService.addMember({ team_id: membersModalTeam.id, student_id: studentId });
      
      // Update local state
      const updatedTeams = await pfeService.getTeams(selectedGroupId);
      setTeams(updatedTeams);
      
      const updatedTeam = updatedTeams.find(t => t.id === membersModalTeam.id);
      if (updatedTeam) {
        setMembersModalTeam(updatedTeam);
        fetchAvailableStudents(updatedTeam);
      }
      
      alert(t('student.pfe.memberAdded', { defaultValue: 'Member added successfully!' }));
    } catch (e) {
      alert(e.response?.data?.message || t('student.pfe.addMemberFailed', { defaultValue: 'Failed to add member.' }));
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (teamId, studentId) => {
    if (!window.confirm(t('student.pfe.removeMemberConfirm', { defaultValue: 'Are you sure you want to remove this member from the team?' }))) return;
    try {
      await pfeService.removeMember(teamId, studentId);
      // Refresh the specific team's data in local state
      const updatedTeams = await pfeService.getTeams(selectedGroupId);
      setTeams(updatedTeams);
      
      // Update the modal's team data as well
      const updatedTeam = updatedTeams.find(t => t.id === teamId);
      if (updatedTeam) setMembersModalTeam(updatedTeam);
      
      alert(t('student.pfe.memberRemoved', { defaultValue: 'Member removed successfully.' }));
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || t('student.pfe.removeMemberFailed', { defaultValue: 'Failed to remove member.' }));
    }
  };

  const userInTeam = teams.some(
    (t) => t.members?.some((m) => Number(m.id) === Number(user?.id))
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('student.pfe.title', { defaultValue: 'PFE Portal' })}</h1>
          <p className="page-subtitle">{t('student.pfe.subtitle', { defaultValue: 'Manage your end-of-study project.' })}</p>
        </div>
        <div className="page-header__actions">
          {!userInTeam && (
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateTeam(true)}>
              <Plus size={18} /> {t('student.pfe.createTeam', { defaultValue: 'Create Team' })}
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={handleOpenSubmissionModal}>
            <Upload size={18} /> {existingSubmission ? t('student.pfe.modifyPfe', { defaultValue: 'Modify PFE' }) : t('student.pfe.submitPfe', { defaultValue: 'Submit PFE' })}
          </button>
        </div>
      </div>

      <div className="grid-cards">
        {loading ? (
          <div className="loading-state">{t('student.pfe.loading', { defaultValue: 'Loading PFE...' })}</div>
        ) : teams.length === 0 ? (
          !userInTeam ? (
            <div className="card-action" onClick={() => setShowCreateTeam(true)}>
              <div className="card-action__icon">
                <GraduationCap size={24} />
              </div>
              <h3 className="card-action__title">{t('student.pfe.createTeamTitle', { defaultValue: 'Create PFE Team' })}</h3>
              <p className="card-action__text">{t('student.pfe.createTeamText', { defaultValue: 'Start your graduation project team' })}</p>
            </div>
          ) : (
            <div className="empty-state-card card">
              <GraduationCap size={48} className="empty-state-card__icon" />
              <h3 className="empty-state-card__title">{t('student.pfe.emptyTitle', { defaultValue: 'No PFE Teams Found' })}</h3>
              <p>{t('student.pfe.emptyText', { defaultValue: 'No teams are available in your current group.' })}</p>
            </div>
          )
        ) : (
          <>
            {teams.map(team => {
              const isMember = team.members?.some(m => Number(m.id) === Number(user?.id));
              const canDeleteTeam = isTeamCreator(team);
              return (
                <div key={team.id} className="card card--col">
                  <div>
                    <div className="card__head">
                      <div className="card__title-group">
                        <div className="media-icon media-icon--primary">
                          <GraduationCap size={20} />
                        </div>
                        <span>{team.name}</span>
                      </div>
                      {isMember && (
                        <span className="badge badge-success badge--trailing">
                          <CheckCircle size={14} />
                          <span>{t('student.agile.myTeam', { defaultValue: 'My Team' })}</span>
                        </span>
                      )}
                    </div>

                    <div className="card__body">
                      <button
                        type="button"
                        className="badge-btn"
                        onClick={() => handleViewMembers(team)}
                      >
                        <Users size={14} />
                        {Array.isArray(team.members) ? team.members.length : (team.members || 0)} Students
                      </button>
                    </div>
                  </div>

                  <div className="card__footer">
                    {isMember ? (
                      <div className="agile-team-card__toolbar">
                        <button
                          type="button"
                          className="icon-action-btn"
                          onClick={() => handleOpenRename(team)}
                        title={t('student.pfe.renameTeam', { defaultValue: 'Rename Team' })}
                        >
                          <Edit2 size={18} />
                        </button>
                        {canDeleteTeam && (
                          <button
                            type="button"
                            className="icon-action-btn icon-action-btn--danger"
                            onClick={() => handleDeleteTeam(team.id)}
                            title={t('student.pfe.deleteTeam', { defaultValue: 'Delete Team' })}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button type="button" className="btn btn-secondary btn--block" onClick={() => handleJoin(team.id)}>
                        {t('student.pfe.joinTeam', { defaultValue: 'Join Team' })}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {!userInTeam && (
              <div className="card-action" onClick={() => setShowCreateTeam(true)}>
                <Plus size={24} className="card-action__plus" />
                <span className="font-medium">{t('student.pfe.createAnother', { defaultValue: 'Create Another Team' })}</span>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">{existingSubmission ? t('student.pfe.modifyDetails', { defaultValue: 'Modify PFE Details' }) : t('student.pfe.submitDetails', { defaultValue: 'Submit PFE Details' })}</h2>
              <button type="button" className="modal-close" onClick={() => {
                setShowModal(false);
                setExistingSubmission(null);
              }} aria-label={t('common.close')}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="pfe-submission-form">
              {existingSubmission && (
                <div className="status-banner">{t('student.pfe.editingExisting', { defaultValue: 'Editing your existing PFE submission' })}</div>
              )}
              <div className="form-group">
                <label className="form-label" htmlFor="pfe-team">{t('student.pfe.selectYourTeam', { defaultValue: 'Select Your Team' })}</label>
                <select
                  id="pfe-team"
                  className="form-input"
                  required
                  value={formData.pfe_team_id}
                  onChange={e => setFormData({...formData, pfe_team_id: e.target.value})}
                >
                  <option value="" disabled>{t('student.pfe.selectTeam', { defaultValue: 'Select a team...' })}</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="pfe-title">{t('student.pfe.projectTitle', { defaultValue: 'Project Title' })}</label>
                <input id="pfe-title" type="text" className="form-input" required value={formData.project_title} onChange={e => setFormData({...formData, project_title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="pfe-desc">{t('student.pfe.description', { defaultValue: 'Description' })}</label>
                <textarea id="pfe-desc" className="form-input" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label form-label--inline-icon"><ExternalLink size={14}/>{t('student.pfe.repositoryUrl', { defaultValue: 'Repository URL' })}</label>
                <input type="url" className="form-input" value={formData.project_repo} onChange={e => setFormData({...formData, project_repo: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label form-label--inline-icon"><ExternalLink size={14}/>{t('student.pfe.liveDemoUrl', { defaultValue: 'Live Demo URL' })}</label>
                <input type="url" className="form-input" value={formData.project_demo} onChange={e => setFormData({...formData, project_demo: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label form-label--inline-icon"><Video size={14}/>{t('student.pfe.explanationVideoLink', { defaultValue: 'Explanation Video Link' })}</label>
                <input type="url" className="form-input" placeholder="YouTube, Loom, etc." value={formData.explanation_video} onChange={e => setFormData({...formData, explanation_video: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label form-label--inline-icon"><FileText size={14}/>{t('student.pfe.finalReportLink', { defaultValue: 'Final Report Link (URL)' })}</label>
                <input type="url" className="form-input" placeholder="Google Drive, Dropbox, etc." value={formData.report_pdf} onChange={e => setFormData({...formData, report_pdf: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowModal(false);
                  setExistingSubmission(null);
                }} disabled={submitting}>{t('student.pfe.cancel', { defaultValue: 'Cancel' })}</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? t('student.pfe.saving', { defaultValue: 'Saving...' }) : (existingSubmission ? t('student.pfe.saveChanges', { defaultValue: 'Save Changes' }) : t('student.pfe.submitPfe', { defaultValue: 'Submit PFE' }))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showCreateTeam && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">{t('student.pfe.createTeamTitle', { defaultValue: 'Create PFE Team' })}</h2>
              <button type="button" className="modal-close" onClick={() => setShowCreateTeam(false)} aria-label={t('common.close')}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTeam}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-pfe-team">{t('student.pfe.teamName', { defaultValue: 'Team Name' })}</label>
                <input id="new-pfe-team" type="text" className="form-input" required value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="e.g. EduTrack Team" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateTeam(false)}>{t('student.pfe.cancel', { defaultValue: 'Cancel' })}</button>
                <button type="submit" className="btn btn-primary">{t('student.pfe.createTeam', { defaultValue: 'Create Team' })}</button>
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

            <div className="modal-body scroll-region--sm">
              <div className="member-list-stack">
              {Array.isArray(membersModalTeam.member_details) && membersModalTeam.member_details.length > 0 ? (
                membersModalTeam.member_details.map((member, idx) => (
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
              ) : Array.isArray(membersModalTeam.members) && membersModalTeam.members.length > 0 ? (
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
                    {isTeamCreator(membersModalTeam) && Number(member.id) !== Number(user?.id) && (
                      <button
                        type="button"
                        className="icon-action-btn icon-action-btn--danger"
                        onClick={() => handleRemoveMember(membersModalTeam.id, member.id)}
                        title={t('student.pfe.removeMember', { defaultValue: 'Remove Member' })}
                        aria-label={`Remove ${member.name || 'member'}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-italic-muted padded-y-muted">
                  No students in this team yet.
                </div>
              )}
            </div>

              {isTeamMember(membersModalTeam) && availableStudents.length > 0 && (
                <div className="member-invite-section" style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border-color)' }}>
                  <h4 className="card__overline">{t('student.pfe.addMember', { defaultValue: 'ADD MEMBER' })}</h4>
                  <div className="flex-row gap-xs">
                    <select
                      className="form-input form-input--compact-select"
                      onChange={(e) => handleAddMember(e.target.value)}
                      defaultValue=""
                      disabled={isAddingMember}
                    >
                      <option value="" disabled>{t('student.pfe.searchClassmates', { defaultValue: 'Search classmates...' })}</option>
                      {availableStudents.map(student => (
                        <option key={student.id} value={student.id}>{student.name} ({student.email})</option>
                      ))}
                    </select>
                  </div>
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

      {showRenameModal && teamToRename && (
        <div className="modal-overlay">
          <div className="modal-content modal-content--narrow">
            <div className="modal-header">
              <h2 className="font-bold">{t('student.pfe.renameTeam', { defaultValue: 'Rename Team' })}</h2>
              <button type="button" className="modal-close" onClick={() => setShowRenameModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRename}>
              <div className="padded-y-sm">
                <label className="form-label">{t('student.pfe.newTeamName', { defaultValue: 'New Team Name' })}</label>
                <input
                  type="text"
                  className="form-input"
                  value={newRenameName}
                  onChange={(e) => setNewRenameName(e.target.value)}
                  placeholder="Enter new team name"
                  autoFocus
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRenameModal(false)}>
                  {t('student.pfe.cancel', { defaultValue: 'Cancel' })}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t('student.pfe.renameTeam', { defaultValue: 'Rename Team' })}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPFE;
