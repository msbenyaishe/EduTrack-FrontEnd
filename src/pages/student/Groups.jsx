import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, BookOpen, AlertCircle } from 'lucide-react';
import { studentService } from '../../services/studentService';
import '../../styles/tables.css';

const StudentGroups = () => {
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
    } catch (e) {
      setGroups([
        { id: 1, name: 'L3 INFO Grp A', year: '2025', teacher_name: 'Mr. Smith', joined_at: '2025-02-10' },
      ]);
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
      setJoinError(e.response?.data?.message || 'Invalid invite code or group already joined.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Groups</h1>
          <p className="page-subtitle">Groups you are currently enrolled in.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Join Group
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Group Name</th>
              <th>Teacher</th>
              <th>Year</th>
              <th>Joined At</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center text-muted py-4">Loading...</td></tr>
            ) : groups.length === 0 ? (
              <tr><td colSpan="5" className="text-center text-muted py-4">You haven't joined any groups yet.</td></tr>
            ) : (
              groups.map(group => (
                <tr key={group.id}>
                  <td className="font-semibold flex items-center gap-2">
                    <Users size={16} className="text-primary-color" />
                    {group.name || 'Unnamed Group'}
                  </td>
                  <td>{group.teacher_name || 'TBD'}</td>
                  <td>{group.year || 'N/A'}</td>
                  <td>{group.joined_at ? new Date(group.joined_at).toLocaleDateString() : 'N/A'}</td>
                  <td className="text-right">
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                      onClick={() => navigate('/student/workshops')}
                    >
                      <BookOpen size={14} style={{ marginRight: '0.25rem' }}/> View Tasks
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">Join Group</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><span style={{fontSize: '1.25rem'}}>&times;</span></button>
            </div>
            
            {joinError && (
              <div className="error-message">
                <AlertCircle size={18} />
                <span>{joinError}</span>
              </div>
            )}

            <form onSubmit={handleJoin}>
              <div className="form-group">
                <label className="form-label">Invite Code</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="Enter the 6-character code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  disabled={joining}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={joining}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={joining}>
                  {joining ? 'Joining...' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGroups;
