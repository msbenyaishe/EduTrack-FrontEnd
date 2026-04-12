import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Mail, Clock, Trash2, Plus, BookOpen, Share2, Calendar, X } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import '../../styles/tables.css';

const GroupDetails = () => {
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
      setGroup({ id, name: 'Group Not Found', year: '-', invite_code: 'ERROR' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to remove this student from the group?')) {
      try {
        await teacherService.removeStudentFromGroup(id, studentId);
        setStudents(students.filter(s => s.id !== studentId));
      } catch (e) {
        console.error(e);
        alert('Failed to remove student.');
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
      alert('Failed to assign module. It might already be assigned.');
    }
  };

  const handleUnassignModule = async (moduleId) => {
    if (window.confirm('Are you sure you want to remove this module from the group?')) {
      try {
        await teacherService.unassignModuleFromGroup(moduleId, id);
        setModules(modules.filter(m => m.id !== moduleId));
      } catch (e) {
        console.error(e);
        alert('Failed to remove module.');
      }
    }
  };

  const handleGenerateNewCode = async () => {
    if (window.confirm('Generating a new code will immediately invalidate the old one. Continue?')) {
      try {
        const data = await teacherService.generateInviteCode(id);
        setGroup({ ...group, invite_code: data.invite_code });
      } catch (e) {
        console.error(e);
        alert('Failed to generate new code.');
      }
    }
  };

  const handleUpdateExpiration = async () => {
    setUpdatingExpiry(true);
    try {
      await teacherService.updateGroup(id, { invite_expires_at: inviteExpiry });
      setGroup({ ...group, invite_expires_at: inviteExpiry });
      alert('Expiration date updated successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to update expiration date.');
    } finally {
      setUpdatingExpiry(false);
    }
  };

  if (loading) {
    return <div className="center-loading">Loading group details...</div>;
  }

  return (
    <div>
      <div className="page-header page-header--spaced">
        <div className="page-header__back-row">
          <button
            type="button"
            className="btn btn-secondary btn--icon-square"
            onClick={() => navigate('/teacher/groups')}
            aria-label="Back to groups"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{group?.name}</h1>
            <p className="page-subtitle">Academic Year: {group?.year}</p>
          </div>
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main-stack">
          <div className="card panel-section">
            <div className="panel-section__head">
              <h2 className="panel-section__title">
                <Users size={20} />
                Enrolled Students ({students.length})
              </h2>
            </div>

            <div className="stacked-gap">
              {students.length === 0 ? (
                <div className="empty-modal-message">No students have joined this group yet.</div>
              ) : (
                students.map((student) => (
                  <div key={student.id} className="member-row">
                    <div className="member-row__main">
                      <div className="member-avatar">
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="member-name">{student.name}</div>
                        <div className="member-meta">
                          <span className="member-meta__item"><Mail size={12} /> {student.email}</span>
                          <span className="member-meta__item"><Clock size={12} /> {new Date(student.joined_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-icon-danger"
                      onClick={() => handleRemoveStudent(student.id)}
                      title="Remove Student"
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
                Assigned Modules ({modules.length})
              </h2>
              <button type="button" className="btn btn-primary btn--sm" onClick={() => setShowModuleModal(true)}>
                <Plus size={16} /> Assign Module
              </button>
            </div>

            <div className="module-grid">
              {modules.length === 0 ? (
                <div className="module-grid__empty">No modules assigned to this group yet.</div>
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
                      title="Remove Module"
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
              Invitation
            </h2>
          </div>

          <div className="sidebar-stack">
            <div>
              <div className="invite-label">Invite Code</div>
              <div className="invite-row">
                <div className="invite-code-box">
                  {group?.invite_code || '---'}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn--sm"
                  onClick={handleGenerateNewCode}
                  title="Renew Code"
                >
                  Regenerate
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="invite-label label-with-icon" htmlFor="invite-expiry">
                <Calendar size={12} /> Expiration Date
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
                      ? <span className="field-hint--error">Code has expired.</span>
                      : `Expires on ${new Date(group.invite_expires_at).toLocaleString()}`)
                  : 'No expiration date set.'}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn--block"
              onClick={handleUpdateExpiration}
              disabled={updatingExpiry}
            >
              {updatingExpiry ? 'Updating...' : 'Save Expiration'}
            </button>
          </div>
        </div>
      </div>

      {showModuleModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-content--assign">
            <div className="modal-header">
              <h2 className="font-bold">Assign Module</h2>
              <button type="button" className="modal-close" onClick={() => setShowModuleModal(false)} aria-label="Close"><X size={20}/></button>
            </div>

            <div className="modal-assign-intro">
              <p className="modal-hint">Select a module to assign to <strong>{group?.name}</strong>.</p>

              <div className="assign-list">
                {allModules.filter(am => !modules.some(m => m.id === am.id)).length === 0 ? (
                  <div className="assign-list__empty">All modules are already assigned.</div>
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
