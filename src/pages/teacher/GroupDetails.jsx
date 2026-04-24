import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Mail, Clock, Trash2, Plus, BookOpen, Share2, Calendar, X, Link as LinkIcon } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/locale';
import { formatAcademicYear, formatGroupTitle } from '../../utils/groupFormatters';

function pickStudentPhoto(student) {
  if (!student || typeof student !== 'object') return null;
  return (
    student.personal_image ||
    student.personal_image_url ||
    student.profile_picture ||
    student.profile_picture_url ||
    student.avatar ||
    student.avatarUrl ||
    student.photo ||
    student.photoUrl ||
    null
  );
}

function pickPortfolioLink(student) {
  if (!student || typeof student !== 'object') return null;
  return student.portfolio_link || student.portfolioLink || student.portfolio || null;
}


const GroupDetails = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || 'en';
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [modules, setModules] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [inviteExpiry, setInviteExpiry] = useState('');
  const [updatingExpiry, setUpdatingExpiry] = useState(false);

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const fetchGroupData = async () => {
    try {
      const [groupData, studentsData, groupModules, allTeacherModules] = await Promise.all([
        teacherService.getGroupDetails(id),
        teacherService.getGroupStudents(id),
        teacherService.getGroupModules(id),
        teacherService.getModules()
      ]);
      setGroup(groupData);
      setStudents(studentsData);
      setModules(groupModules);
      setAllModules(allTeacherModules);

      if (groupData.invite_expires_at) {
        const date = new Date(groupData.invite_expires_at);
        const isoString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
        setInviteExpiry(isoString.slice(0, 16));
      }
    } catch (e) {
      console.error(e);
      setGroup({ id, name: t('teacher.groupDetails.groupNotFound', { defaultValue: 'Group Not Found' }), year: '-', invite_code: 'ERROR' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (window.confirm(t('teacher.groupDetails.removeStudentConfirm', { defaultValue: 'Are you sure you want to remove this student from the group?' }))) {
      try {
        await teacherService.removeStudentFromGroup(id, studentId);
        setStudents(students.filter(s => s.id !== studentId));
      } catch (e) {
        console.error(e);
        alert(t('teacher.groupDetails.removeStudentFailed', { defaultValue: 'Failed to remove student.' }));
      }
    }
  };

  const handleAssignModule = async (moduleId) => {
    try {
      await teacherService.assignModuleToGroup({ module_id: moduleId, group_id: id });
      const mod = allModules.find(m => m.id === parseInt(moduleId));
      setModules([...modules, mod]);
      setShowModuleModal(false);
    } catch (e) {
      console.error(e);
      alert(t('teacher.groupDetails.assignModuleFailed', { defaultValue: 'Failed to assign module. It might already be assigned.' }));
    }
  };

  const handleUnassignModule = async (moduleId) => {
    if (window.confirm(t('teacher.groupDetails.removeModuleConfirm', { defaultValue: 'Are you sure you want to remove this module from the group?' }))) {
      try {
        await teacherService.unassignModuleFromGroup(moduleId, id);
        setModules(modules.filter(m => m.id !== moduleId));
      } catch (e) {
        console.error(e);
        alert(t('teacher.groupDetails.removeModuleFailed', { defaultValue: 'Failed to remove module.' }));
      }
    }
  };

  const handleGenerateNewCode = async () => {
    if (window.confirm(t('teacher.groupDetails.regenerateConfirm', { defaultValue: 'Generating a new code will immediately invalidate the old one. Continue?' }))) {
      try {
        const data = await teacherService.generateInviteCode(id);
        setGroup({ ...group, invite_code: data.invite_code });
      } catch (e) {
        console.error(e);
        alert(t('teacher.groupDetails.regenerateFailed', { defaultValue: 'Failed to generate new code.' }));
      }
    }
  };

  const handleUpdateExpiration = async () => {
    setUpdatingExpiry(true);
    try {
      await teacherService.updateGroup(id, { invite_expires_at: inviteExpiry });
      setGroup({ ...group, invite_expires_at: inviteExpiry });
      alert(t('teacher.groupDetails.expirationUpdated', { defaultValue: 'Expiration date updated successfully!' }));
    } catch (e) {
      console.error(e);
      alert(t('teacher.groupDetails.expirationUpdateFailed', { defaultValue: 'Failed to update expiration date.' }));
    } finally {
      setUpdatingExpiry(false);
    }
  };

  if (loading) {
    return <div className="center-loading">{t('teacher.groupDetails.loading', { defaultValue: 'Loading group details...' })}</div>;
  }

  return (
    <div>
      <div className="page-header page-header--spaced">
        <div className="page-header__back-row">
          <button
            type="button"
            className="btn btn-secondary btn--icon-square"
            onClick={() => navigate('/teacher/groups')}
            aria-label={t('teacher.groupDetails.backToGroups', { defaultValue: 'Back to groups' })}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{group?.name}</h1>
            <p className="page-subtitle">{t('teacher.groupDetails.academicYear', { defaultValue: 'Academic Year:' })} {formatAcademicYear(group?.year)}</p>
          </div>
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main-stack">
          <div className="card panel-section">
            <div className="panel-section__head">
              <h2 className="panel-section__title">
                <Users size={20} />
                {t('teacher.groupDetails.enrolledStudents', { defaultValue: 'Enrolled Students' })} ({students.length})
              </h2>
            </div>

            <div className="stacked-gap">
              {students.length === 0 ? (
                <div className="empty-modal-message">{t('teacher.groupDetails.noStudentsYet', { defaultValue: 'No students have joined this group yet.' })}</div>
              ) : (
                students.map((student) => (
                  <div key={student.id} className="member-row">
                    <div className="member-row__main">
                      <div className="member-avatar">
                        {pickStudentPhoto(student) ? (
                          <img
                            src={pickStudentPhoto(student)}
                            alt={student.name || t('roles.student')}
                            className="member-avatar__img"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          student.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="member-name">{student.name}</div>
                        <div className="member-meta">
                          <span className="member-meta__item"><Mail size={12} /> {student.email}</span>
                          <span className="member-meta__item"><Clock size={12} /> {formatDate(student.joined_at, language)}</span>
                          {pickPortfolioLink(student) ? (
                            <a
                              className="member-meta__item"
                              href={pickPortfolioLink(student)}
                              target="_blank"
                              rel="noreferrer"
                              title={t('teacher.groupDetails.openPortfolio', { defaultValue: 'Open portfolio' })}
                            >
                              <LinkIcon size={12} /> {t('teacher.groupDetails.portfolio', { defaultValue: 'Portfolio' })}
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-icon-danger"
                      onClick={() => handleRemoveStudent(student.id)}
                      title={t('teacher.groupDetails.removeStudent', { defaultValue: 'Remove Student' })}
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card panel-section">
            <div className="panel-section__head">
              <h2 className="panel-section__title">
                <BookOpen size={20} />
                {t('teacher.groupDetails.assignedModules', { defaultValue: 'Assigned Modules' })} ({modules.length})
              </h2>
              <button type="button" className="btn btn-primary btn--sm" onClick={() => setShowModuleModal(true)}>
                <Plus size={16} /> {t('teacher.groupDetails.assignModule', { defaultValue: 'Assign Module' })}
              </button>
            </div>

            <div className="module-grid">
              {modules.length === 0 ? (
                <div className="module-grid__empty">{t('teacher.groupDetails.noModules', { defaultValue: 'No modules assigned to this group yet.' })}</div>
              ) : (
                modules.map((mod) => (
                  <div key={mod.id} className="module-row">
                    <div className="module-row__info">
                      <div className="module-icon-sm">
                         <BookOpen size={16} />
                      </div>
                      <span className="module-title">{mod.title}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-unassign"
                      onClick={() => handleUnassignModule(mod.id)}
                      title={t('teacher.groupDetails.removeModule', { defaultValue: 'Remove Module' })}
                    >
                      <X size={18}/>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="card sidebar-card">
          <div className="panel-section__head panel-section__head--only">
            <h2 className="panel-section__title">
              <Share2 size={20} />
              {t('teacher.groupDetails.invitation', { defaultValue: 'Invitation' })}
            </h2>
          </div>

          <div className="sidebar-stack">
            <div>
              <div className="invite-label">{t('teacher.groupDetails.inviteCode', { defaultValue: 'Invite Code' })}</div>
              <div className="invite-row">
                <div className="invite-code-box">
                  {group?.invite_code || '---'}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn--sm"
                  onClick={handleGenerateNewCode}
                  title={t('teacher.groupDetails.renewCode', { defaultValue: 'Renew Code' })}
                >
                  {t('teacher.groupDetails.regenerate', { defaultValue: 'Regenerate' })}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="invite-label label-with-icon" htmlFor="invite-expiry">
                <Calendar size={12} /> {t('teacher.groupDetails.expirationDate', { defaultValue: 'Expiration Date' })}
              </label>
              <input
                id="invite-expiry"
                type="datetime-local"
                className="form-input form-input--tight-top"
                value={inviteExpiry}
                onChange={(e) => setInviteExpiry(e.target.value)}
              />
              <p className="field-hint">
                {group?.invite_expires_at
                  ? (new Date(group.invite_expires_at) < new Date()
                      ? <span className="field-hint--error">{t('teacher.groupDetails.codeExpired', { defaultValue: 'Code has expired.' })}</span>
                      : t('teacher.groupDetails.expiresOn', { defaultValue: 'Expires on {{date}}', date: new Date(group.invite_expires_at).toLocaleString() }))
                  : t('teacher.groupDetails.noExpiration', { defaultValue: 'No expiration date set.' })}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn--block"
              onClick={handleUpdateExpiration}
              disabled={updatingExpiry}
            >
              {updatingExpiry ? t('teacher.groupDetails.updating', { defaultValue: 'Updating...' }) : t('teacher.groupDetails.saveExpiration', { defaultValue: 'Save Expiration' })}
            </button>
          </div>
        </div>
      </div>

      {showModuleModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-content--assign">
            <div className="modal-header">
              <h2 className="font-bold">{t('teacher.groupDetails.assignModule', { defaultValue: 'Assign Module' })}</h2>
              <button type="button" className="modal-close" onClick={() => setShowModuleModal(false)} aria-label={t('common.close')}><X size={20}/></button>
            </div>

            <div className="modal-assign-intro">
              <p className="modal-hint">{t('teacher.groupDetails.selectModuleFor', { defaultValue: 'Select a module to assign to {{group}}.', group: group?.name })}</p>

              <div className="assign-list">
                {allModules.filter(am => !modules.some(m => m.id === am.id)).length === 0 ? (
                  <div className="assign-list__empty">{t('teacher.groupDetails.allModulesAssigned', { defaultValue: 'All modules are already assigned.' })}</div>
                ) : (
                  allModules.filter(am => !modules.some(m => m.id === am.id)).map(am => (
                    <div
                      key={am.id}
                      className="assign-pick-row"
                      onClick={() => handleAssignModule(am.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleAssignModule(am.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <span className="assign-pick-row__title">{am.title}</span>
                      <Plus size={16} className="assign-pick-row__icon" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
