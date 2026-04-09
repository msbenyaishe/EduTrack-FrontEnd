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
    } catch (e) {
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
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <Plus size={18} /> New Group
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Group Name</th>
              <th>Academic Year</th>
              <th>Invite Code</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">Loading...</td></tr>
            ) : groups.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted">No groups found.</td></tr>
            ) : (
              groups.map(group => (
                <tr key={group.id}>
                  <td className="font-semibold">{group.name}</td>
                  <td>{group.year}</td>
                  <td>
                    {group.invite_code ? (
                      <div className="flex items-center gap-2">
                        <span className="badge badge-primary" style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          {group.invite_code}
                        </span>
                        <button 
                          className="icon-btn" 
                          style={{ width: 28, height: 28 }}
                          onClick={() => copyToClipboard(group.invite_code)}
                        >
                          {copiedCode === group.invite_code ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn btn-secondary w-auto" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                        onClick={() => handleGenerateCode(group.id)}
                        disabled={generatingCode === group.id}
                      >
                        {generatingCode === group.id ? 'Generating...' : 'Generate Code'}
                      </button>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="icon-btn" title="Edit Group" onClick={() => handleEdit(group)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn danger" title="Delete Group" onClick={() => handleDelete(group.id)}>
                        <Trash2 size={16} />
                      </button>
                      <button className="btn btn-secondary" onClick={() => navigate(`/teacher/groups/${group.id}`)}>
                        <Users size={14} style={{ marginRight: '0.25rem' }}/> Manage
                      </button>
                    </div>
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
              <h2 className="font-bold">{isEditing ? 'Edit Group' : 'Create Group'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Group Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="e.g. Master 1 CS"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
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
