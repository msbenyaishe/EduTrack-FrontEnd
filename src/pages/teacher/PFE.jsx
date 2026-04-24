import React, { useState, useEffect } from 'react';
import { GraduationCap, Trash2, Users, X, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { teacherService } from '../../services/teacherService';
import { pfeService } from '../../services/pfeService';
import { useTranslation } from 'react-i18next';


const TeacherPFE = () => {
  const { t } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [pfeTeams, setPfeTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);

  const [showMembersModal, setShowMembersModal] = useState(false);
  const [membersModalTeam, setMembersModalTeam] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchPfeTeams(selectedGroup);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const grpData = await teacherService.getGroups();
      setGroups(grpData);
      if(grpData.length > 0) setSelectedGroup(grpData[0].id);
    } catch {
      setGroups([{ id: 1, name: 'L3 INFO Grp A' }]);
      setSelectedGroup(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchPfeTeams = async (groupId) => {
    setLoadingTeams(true);
    try {
      const data = await pfeService.getTeams(groupId);
      setPfeTeams(data);
    } catch {
      setPfeTeams([{ id: 1, name: 'PFE EduTrack', members: 2 }]);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(t('teacher.pfe.deleteConfirm', { defaultValue: 'Are you sure you want to permanently delete this PFE team? This action cannot be undone.' }));
    if (!confirmed) return;
    
    try {
      const response = await pfeService.deleteTeam(id);
      fetchPfeTeams(selectedGroup);
      alert(response.message || t('teacher.pfe.deletedSuccess', { defaultValue: 'PFE team deleted successfully.' }));
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.message || t('teacher.pfe.deleteFailed', { defaultValue: 'Failed to delete PFE team from database.' });
      alert(errorMsg);
    }
  };

  const handleViewMembers = (team) => {
    setMembersModalTeam(team);
    setShowMembersModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('teacher.pfe.title', { defaultValue: 'PFE Teams' })}</h1>
          <p className="page-subtitle">{t('teacher.pfe.subtitle', { defaultValue: "End-of-study projects (Projet de Fin d'Études)" })}</p>
        </div>
      </div>

      <div className="card card--toolbar">
        <label className="card--toolbar__label" htmlFor="pfe-group">{t('teacher.pfe.selectGroup', { defaultValue: 'Select Group:' })}</label>
        <div className="card--toolbar__fields">
          <select
            id="pfe-group"
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
        {loading || loadingTeams ? (
          <div className="loading-state">{t('teacher.pfe.loading', { defaultValue: 'Loading PFE teams...' })}</div>
        ) : pfeTeams.length === 0 ? (
          <div className="empty-state-card card">
            <GraduationCap size={48} className="empty-state-card__icon" />
            <h3 className="empty-state-card__title">{t('teacher.pfe.emptyTitle', { defaultValue: 'No PFE Teams Found' })}</h3>
            <p>{t('teacher.pfe.emptyText', { defaultValue: 'No students in this group have created PFE teams yet.' })}</p>
          </div>
        ) : (
          pfeTeams.map(team => (
            <div key={team.id} className="card card--col">
              <div>
                <div className="card__head">
                  <div className="card__title-group">
                    <div className="media-icon media-icon--primary">
                      <GraduationCap size={20} />
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
                    {Array.isArray(team.members) ? team.members.length : (team.members || 0)} {t('teacher.pfe.members', { defaultValue: 'Members' })}
                  </button>
                  <div className="card__muted">{t('teacher.pfe.teamHint', { defaultValue: 'Final graduation project team' })}</div>
                </div>
              </div>

              <div className="card__footer">
                <Link
                  to="/teacher/submissions"
                  state={{ filterType: 'PFE', teamName: team.name }}
                  className="btn btn-secondary btn--edit-row"
                >
                  <Upload size={16} /> {t('teacher.pfe.submissions', { defaultValue: 'Submissions' })}
                </Link>
                <button type="button" className="icon-action-btn icon-action-btn--danger" onClick={() => handleDelete(team.id)} title={t('teacher.pfe.deleteTeam', { defaultValue: 'Delete Team' })}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showMembersModal && membersModalTeam && (
        <div className="modal-overlay">
          <div className="modal-content modal-content--narrow">
            <div className="modal-header">
              <h2 className="font-bold modal-title-row">
                {membersModalTeam.name} {t('teacher.pfe.members', { defaultValue: 'Members' })}
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
                    ? t('teacher.pfe.noStudents', { defaultValue: 'No students in this team yet.' })
                    : t('teacher.pfe.memberNamesUnavailable', { defaultValue: 'Member names are not available for this team. The list will appear once the server returns a members array on each team.' })}
                </div>
              )}
            </div>

            <div className="modal-footer modal-footer--stack modal-footer--mt">
              <button
                type="button"
                className="btn btn-secondary btn--block"
                onClick={() => setShowMembersModal(false)}
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPFE;
