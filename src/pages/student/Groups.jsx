import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, BookOpen, AlertCircle, X } from 'lucide-react';
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
    } catch {
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
        <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
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
              <tr><td colSpan={5} className="table-loading">Loading...</td></tr>
            ) : groups.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-empty-center">
                  <div className="table-empty-inner">
                    <div className="table-empty-inner__icon-wrap">
                      <Users size={32} />
                    </div>
                    <h3 className="table-empty-inner__title">No Groups Yet</h3>
                    <p className="table-empty-inner__text">You haven&apos;t joined any groups yet. Join a group using an invite code provided by your teacher.</p>
                    <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
                      <Plus size={18} /> Join Your First Group
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              groups.map(group => (
                <tr key={group.id}>
                  <td className="table-cell-flex font-semibold">
                    <Users size={16} className="table-icon-primary" />
                    {group.name || 'Unnamed Group'}
                  </td>
                  <td>{group.teacher_name || 'TBD'}</td>
                  <td>{group.year || 'N/A'}</td>
                  <td>{group.joined_at ? new Date(group.joined_at).toLocaleDateString() : 'N/A'}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      className="btn btn-secondary btn--sm"
                      onClick={() => navigate('/student/workshops')}
                    >
                      <BookOpen size={14} className="btn__icon-left" /> View Tasks
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
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close">
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
                <label className="form-label form-label--centered" htmlFor="invite-code">Enter your 6-character invite code</label>
                <input
                  id="invite-code"
                  type="text"
                  className="form-input form-input--invite"
                  required
                  maxLength={6}
                  placeholder="------"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  disabled={joining}
                />
              </div>
              <div className="modal-footer modal-footer--stack">
                <button type="submit" className="btn btn-primary btn--full-sm" disabled={joining}>
                  {joining ? 'Joining...' : 'Join Group'}
                </button>
                <button type="button" className="btn btn-secondary btn--block" onClick={() => setShowModal(false)} disabled={joining}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGroups;
