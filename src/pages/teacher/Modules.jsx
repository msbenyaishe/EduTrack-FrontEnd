import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import '../../styles/tables.css';

const Modules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const data = await teacherService.getModules();
      setModules(data);
    } catch (e) {
      console.error(e);
      setModules([
        { id: 1, title: 'Web Development', description: 'React and Nodejs', created_at: '2025-01-01' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await teacherService.updateModule(editingId, formData);
      } else {
        await teacherService.createModule(formData);
      }
      setShowModal(false);
      setFormData({ title: '', description: '' });
      setEditingId(null);
      fetchModules();
    } catch (e) {
      console.error('Database connection failed or validation error:', e.response?.data || e.message);
      alert('Failed to save to database. Please check your connection.');
    }
  };

  const handleEdit = (mod) => {
    setFormData({ title: mod.title, description: mod.description || '' });
    setEditingId(mod.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await teacherService.deleteModule(id);
        fetchModules();
      } catch (e) {
        console.error(e);
        alert('Failed to delete module.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Modules</h1>
          <p className="page-subtitle">Manage your teaching modules.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({title: '', description: ''}); setShowModal(true); }}>
          <Plus size={18} /> New Module
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Created</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">Loading...</td></tr>
            ) : modules.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted">No modules found.</td></tr>
            ) : (
              modules.map(mod => (
                <tr key={mod.id}>
                  <td className="font-semibold">{mod.title}</td>
                  <td className="text-muted">{mod.description || '-'}</td>
                  <td>{new Date(mod.created_at).toLocaleDateString()}</td>
                  <td className="text-right flex items-center justify-end gap-2">
                    <button className="action-btn" onClick={() => handleEdit(mod)}><Edit2 size={16}/></button>
                    <button className="action-btn danger" onClick={() => handleDelete(mod.id)}><Trash2 size={16}/></button>
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
              <h2 className="font-bold">{editingId ? 'Edit Module' : 'Create Module'}</h2>
              <button className="modal-close" onClick={() => { setShowModal(false); setEditingId(null); setFormData({title: '', description: ''}); }}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Module Title</label>
                <input 
                  type="text" 
                  id="title" 
                  className="form-input" 
                  required 
                  placeholder="e.g. Database Design"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="description">Description (Optional)</label>
                <textarea 
                  id="description" 
                  className="form-input" 
                  placeholder="..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingId(null); setFormData({title: '', description: ''}); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update Module' : 'Save Module'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modules;
