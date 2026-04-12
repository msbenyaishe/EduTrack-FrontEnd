import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, Copy, Share2, Users, X, Edit2, Trash2 } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import '../../styles/tables.css';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', year: new Date().getFullYear().toString() });
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await teacherService.getGroups();
      setGroups(data);
    } catch {
      setGroups([
        { id: 1, name: 'L3 INFO Grp A', year: '2025', invite_code: 'INF2025X' },
        { id: 2, name: 'Master 1 Web', year: '2025', invite_code: null }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await teacherService.updateGroup(editId, formData);
      } else {
        await teacherService.createGroup(formData);
      }
      setShowModal(false);
      setIsEditing(false);
      setEditId(null);
      setFormData({ name: '', year: new Date().getFullYear().toString() });
      fetchGroups();
    } catch (e) {
      console.error(e);
      alert(`Failed to ${isEditing ? 'update' : 'save'} group. Please check your connection.`);
    }
  };

  const handleEdit = (group) => {
    setFormData({ name: group.name, year: group.year });
    setEditId(group.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this group? All associated data will be lost.')) return;
    try {
      await teacherService.deleteGroup(id);
      fetchGroups();
    } catch (e) {
      console.error(e);
      alert('Failed to delete group.');
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({ name: '', year: new Date().getFullYear().toString() });
    setIsEditing(false);
    setEditId(null);
    setShowModal(true);
  };

  const handleGenerateCode = async (id) => {
    setGeneratingCode(id);
    try {
      const data = await teacherService.generateInviteCode(id);
      setGroups(groups.map(g => g.id === id ? { ...g, invite_code: data.invite_code } : g));
    } catch (e) {
      console.error(e);
      alert('Failed to generate invite code.');
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Groups</h1>
          <p className="page-subtitle">Manage your student groups and invites.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenCreateModal}>
          <Plus size={18} /> New Group
        </button>
      </div>

      <div className="grid-cards">
        {loading ? (
          <div className="loading-state">Loading groups...</div>
        ) : groups.length === 0 ? (
          <div className="card-action" onClick={handleOpenCreateModal}>
            <div className="card-action__icon">
              <Users size={24} />
            </div>
            <h3 className="card-action__title">Create Your First Group</h3>
            <p className="card-action__text">Manage student cohorts and assignments</p>
          </div>
        ) : (
          <>
            {groups.map(group => (
              <div key={group.id} className="card card--col">
                <div>
                  <div className="card__head">
                    <div className="card__title-group">
                      <div className="media-icon media-icon--primary">
                        <Users size={20} />
                      </div>
                      {group.name}
                    </div>
                    <span className="badge badge-primary badge--trailing">{group.year}</span>
                  </div>

                  <div className="card__body">
                    <div className="card__overline">Invite Code</div>
                    {group.invite_code ? (
                      <div className="invite-code-inline">
                        <span className="invite-code-inline__value">
                          {group.invite_code}
                        </span>
                        <button
                          type="button"
                          className="icon-action-btn"
                          onClick={() => copyToClipboard(group.invite_code)}
                          title="Copy Code"
                        >
                          {copiedCode === group.invite_code ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-secondary btn--block btn--sm"
                        onClick={() => handleGenerateCode(group.id)}
                        disabled={generatingCode === group.id}
                      >
                        {generatingCode === group.id ? 'Generating...' : 'Generate Invite Code'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="card__footer">
                  <button type="button" className="btn btn-primary btn--edit-row" onClick={() => navigate(`/teacher/groups/${group.id}`)}>
                    <Users size={16} /> Manage
                  </button>
                  <div className="card__footer-actions">
                    <button type="button" className="icon-action-btn" onClick={() => handleEdit(group)} title="Edit group">
                      <Edit2 size={18} />
                    </button>
                    <button type="button" className="icon-action-btn icon-action-btn--danger" onClick={() => handleDelete(group.id)} title="Delete group">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="card-action" onClick={handleOpenCreateModal}>
              <Plus size={24} className="card-action__plus" />
              <span className="font-medium">Add New Group</span>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">{isEditing ? 'Edit Group' : 'Create Group'}</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="group-name">Group Name</label>
                <input
                  id="group-name"
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Master 1 CS"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="group-year">Academic Year</label>
                <input
                  id="group-year"
                  type="text"
                  className="form-input"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEditing ? 'Update Group' : 'Save Group'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
