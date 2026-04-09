import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Mail, Clock, Trash2, Plus, BookOpen, Share2, Calendar, Check, X } from 'lucide-react';
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
        // Convert to YYYY-MM-DDThh:mm for datetime-local
        const date = new Date(groupData.invite_expires_at);
        const isoString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
        setInviteExpiry(isoString.slice(0, 16));
      }
    } catch (e) {
      console.error(e);
      // Fallback
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
    return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading group details...</div>;
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/teacher/groups')}
            style={{ padding: '0.5rem' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{group?.name}</h1>
            <p className="page-subtitle">Academic Year: {group?.year}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Students Section */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} style={{ color: 'var(--primary-color)' }} />
                <h2 className="font-bold text-lg">Enrolled Students ({students.length})</h2>
              </div>
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined At</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No students have joined this group yet.</td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id}>
                        <td className="font-semibold">{student.name}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <Mail size={14} />
                            {student.email}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <Clock size={14} />
                            {new Date(student.joined_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="text-right">
                          <button 
                            className="action-btn danger sm" 
                            onClick={() => handleRemoveStudent(student.id)} 
                            title="Remove Student"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modules Section */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} style={{ color: 'var(--primary-color)' }} />
                <h2 className="font-bold text-lg">Assigned Modules ({modules.length})</h2>
              </div>
              <button className="btn btn-primary sm" onClick={() => setShowModuleModal(true)}>
                <Plus size={16} /> Assign Module
              </button>
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Module Name</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.length === 0 ? (
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No modules assigned to this group yet.</td>
                    </tr>
                  ) : (
                    modules.map((mod) => (
                      <tr key={mod.id}>
                        <td className="font-semibold">{mod.title}</td>
                        <td className="text-right">
                          <button 
                            className="action-btn danger sm" 
                            onClick={() => handleUnassignModule(mod.id)} 
                            title="Remove Module"
                          >
                            <X size={16}/>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Invitation Settings Section */}
        <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Share2 size={20} style={{ color: 'var(--primary-color)' }} />
            <h2 className="font-bold text-lg">Invitation</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="text-xs font-bold text-muted" style={{ textTransform: 'uppercase' }}>Invite Code</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ 
                  backgroundColor: 'var(--bg-light)', 
                  padding: '0.75rem 1rem', 
                  borderRadius: 'var(--radius-sm)', 
                  flex: 1, 
                  fontFamily: 'monospace', 
                  fontWeight: 'bold', 
                  fontSize: '1.125rem',
                  border: '1px solid var(--border-color)',
                  color: 'var(--primary-color)',
                  textAlign: 'center'
                }}>
                  {group?.invite_code || '---'}
                </div>
                <button 
                  className="btn btn-secondary sm" 
                  onClick={handleGenerateNewCode} 
                  title="Renew Code"
                >
                  Regenerate
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="text-xs font-bold text-muted flex items-center gap-1" style={{ textTransform: 'uppercase' }}>
                <Calendar size={12} /> Expiration Date
              </label>
              <input 
                type="datetime-local" 
                className="form-input" 
                style={{ marginTop: '0.5rem' }}
                value={inviteExpiry}
                onChange={(e) => setInviteExpiry(e.target.value)}
              />
              <p className="text-xs text-muted mt-2">
                {group?.invite_expires_at ? (
                  new Date(group.invite_expires_at) < new Date() ? 
                  <span style={{ color: '#ef4444' }}>Code has expired.</span> : 
                  `Expires on ${new Date(group.invite_expires_at).toLocaleString()}`
                ) : 'No expiration date set.'}
              </p>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleUpdateExpiration}
              disabled={updatingExpiry}
              style={{ width: '100%' }}
            >
              {updatingExpiry ? 'Updating...' : 'Save Expiration'}
            </button>
          </div>
        </div>
      </div>

      {/* Assign Module Modal */}
      {showModuleModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2 className="font-bold">Assign Module</h2>
              <button className="modal-close" onClick={() => setShowModuleModal(false)}><X size={20}/></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <p className="text-sm text-muted">Select a module to assign to <strong>{group?.name}</strong>.</p>
              
              <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table className="table">
                  <tbody>
                    {allModules.filter(am => !modules.some(m => m.id === am.id)).length === 0 ? (
                      <tr><td className="text-center py-4 text-muted">All modules are already assigned.</td></tr>
                    ) : (
                      allModules.filter(am => !modules.some(m => m.id === am.id)).map(am => (
                        <tr key={am.id} style={{ cursor: 'pointer' }} onClick={() => handleAssignModule(am.id)}>
                          <td className="flex items-center justify-between">
                            <span className="font-semibold">{am.title}</span>
                            <Plus size={16} className="text-primary-color" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
