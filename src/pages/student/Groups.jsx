import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, BookOpen, AlertCircle, X, Calendar } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/locale';
import { formatGroupTitle, formatAcademicYear } from '../../utils/groupFormatters';


function formatJoinedDate(value) {
  if (value == null || value === '') return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const StudentGroups = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || 'en';
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await studentService.getMyGroups();
      setGroups(data);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinError('');
    setJoining(true);
    try {
      await studentService.joinGroup(inviteCode);
      setShowModal(false);
      setInviteCode('');
      fetchGroups();
    } catch (e) {
      const status = e.response?.status;
      const msg = e.response?.data?.message;
      if (status === 404) {
        setJoinError(
          msg ||
            t('student.groups.inviteNotFound', { defaultValue: 'Invite not found, or the join API is missing. If this keeps happening, confirm VITE_API_URL ends with /api and matches your backend.' })
        );
      } else {
        setJoinError(msg || t('student.groups.invalidCode', { defaultValue: 'Invalid invite code or group already joined.' }));
      }
    } finally {
      setJoining(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('student.groups.title', { defaultValue: 'My Groups' })}</h1>
          <p className="page-subtitle">{t('student.groups.subtitle', { defaultValue: 'Groups you are currently enrolled in.' })}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> {t('student.groups.joinGroup', { defaultValue: 'Join Group' })}
        </button>
      </div>

      <div className="grid-cards">
        {loading ? (
          <div className="loading-state">{t('student.groups.loading', { defaultValue: 'Loading groups...' })}</div>
        ) : groups.length === 0 ? (
          <div className="empty-state-card card">
            <Users size={48} className="empty-state-card__icon" />
            <h3 className="empty-state-card__title">{t('student.groups.emptyTitle', { defaultValue: 'No Groups Yet' })}</h3>
            <p>{t('student.groups.emptyText', { defaultValue: "You haven't joined any groups yet. Join a group using an invite code provided by your teacher." })}</p>
            <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} /> {t('student.groups.joinFirst', { defaultValue: 'Join Your First Group' })}
            </button>
          </div>
        ) : (
          groups.map((group) => {
            const joined = formatJoinedDate(group.joined_at);
            return (
              <div key={group.id} className="card card--col">
                <div>
                  <div className="card__head">
                    <div className="card__title-group">
                      <div className="media-icon media-icon--primary">
                        <Users size={20} />
                      </div>
                      <span>{group.name || t('student.groups.unnamed', { defaultValue: 'Unnamed Group' })}</span>
                    </div>
                    <span className="badge badge--success badge--trailing">
                      {formatAcademicYear(group.year)}
                    </span>
                  </div>

                  <div className="card__body">
                    <p className="card__teacher-line">
                      <strong>{t('student.groups.teacherLabel', { defaultValue: 'Teacher:' })}</strong> {group.teacher_name || t('student.groups.tbd', { defaultValue: 'TBD' })}
                    </p>
                    <div className="student-group-card__joined">
                      <Calendar size={14} className="student-group-card__joined-icon" aria-hidden />
                      <span className="student-group-card__joined-kicker">{t('student.groups.joined', { defaultValue: 'Joined' })}</span>
                      <span className="student-group-card__joined-value">
                        {joined
                          ? formatDate(joined, language, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card__footer">
                  <button
                    type="button"
                    className="btn btn-secondary btn--block"
                    onClick={() => navigate('/student/workshops')}
                  >
                    <BookOpen size={16} /> {t('student.groups.viewTasks', { defaultValue: 'View tasks' })}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">{t('student.groups.joinGroup', { defaultValue: 'Join Group' })}</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label={t('common.close')}>
                <X size={20} />
              </button>
            </div>

            {joinError && (
              <div className="alert alert--danger" role="alert">
                <AlertCircle size={18} />
                <span>{joinError}</span>
              </div>
            )}

            <form onSubmit={handleJoin}>
              <div className="form-group">
                <label className="form-label form-label--centered" htmlFor="invite-code">{t('student.groups.inviteLabel', { defaultValue: 'Enter your 8-character invite code' })}</label>
                <input
                  id="invite-code"
                  type="text"
                  className="form-input form-input--invite"
                  required
                  maxLength={8}
                  placeholder="--------"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  disabled={joining}
                />
              </div>
              <div className="modal-footer modal-footer--stack">
                <button type="submit" className="btn btn-primary btn--full-sm" disabled={joining}>
                  {joining ? t('student.groups.joining', { defaultValue: 'Joining...' }) : t('student.groups.joinGroup', { defaultValue: 'Join Group' })}
                </button>
                <button type="button" className="btn btn-secondary btn--block" onClick={() => setShowModal(false)} disabled={joining}>{t('student.groups.cancel', { defaultValue: 'Cancel' })}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGroups;
