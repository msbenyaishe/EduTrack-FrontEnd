import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Users, Upload, ChevronRight, ExternalLink } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { workshopService } from '../../services/workshopService';
import '../../styles/tables.css';

const TeacherWorkshops = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [modules, setModules] = useState([]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ module_id: '', title: '', description: '', repo: '', pdf_report: '', web_page: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchWorkshops(selectedGroup);
    }
  }, [selectedGroup]);

  const fetchInitialData = async () => {
    try {
      const [grpData, modData] = await Promise.all([
        teacherService.getGroups(),
        teacherService.getModules()
      ]);
      setGroups(grpData);
      setModules(modData);
      if(grpData.length > 0) setSelectedGroup(grpData[0].id);
    } catch (e) {
      // Mock flow
      setGroups([{ id: 1, name: 'L3 INFO Grp A' }]);
      setModules([{ id: 1, title: 'Web Dev' }]);
      setSelectedGroup(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkshops = async (groupId) => {
    setSubLoading(true);
    try {
      const data = await workshopService.getWorkshopsByGroup(groupId);
      setWorkshops(data);
    } catch (e) {
      // Mock data
      setWorkshops([{ 
        id: 1, title: 'Build an API', description: 'Node JS REST', 
        module_id: 1, created_at: new Date().toISOString() 
      }]);
    } finally {
      setSubLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await workshopService.createWorkshop({ ...formData, group_id: selectedGroup });
      setShowModal(false);
      fetchWorkshops(selectedGroup);
    } catch (e) {
      console.error(e);
      alert('Failed to save workshop to database.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await workshopService.deleteWorkshop(id);
      fetchWorkshops(selectedGroup);
    } catch (e) {
      console.error(e);
      alert('Failed to delete workshop.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Workshops</h1>
          <p className="page-subtitle">Assign workshops and review student code.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Workshop
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <p className="font-semibold text-muted">Select Group:</p>
        <select 
          className="form-input" 
          style={{ width: '300px' }}
          value={selectedGroup || ''} 
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name} - {g.year || ''}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Created</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(loading || subLoading) ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">Loading workshops...</td></tr>
            ) : workshops.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">No workshops found for this group.</td></tr>
            ) : (
              workshops.map(ws => (
                <tr key={ws.id}>
                  <td className="font-semibold flex items-center gap-2">
                    <BookOpen size={16} className="text-primary-color" />
                    {ws.title}
                  </td>
                  <td className="text-muted">{ws.description}</td>
                  <td>{new Date(ws.created_at).toLocaleDateString()}</td>
                    <td className="text-right flex items-center justify-end gap-2">
                      {ws.web_page && (
                        <a href={ws.web_page} target="_blank" rel="noopener noreferrer" className="action-btn" title="View Workshop Link">
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <button className="action-btn" onClick={() => navigate(`/teacher/submissions/workshop/${ws.id}`)}>
                        <font className="flex items-center gap-1"><Upload size={14}/> Subs</font>
                      </button>
                      <button className="action-btn danger" onClick={() => handleDelete(ws.id)}>Delete</button>
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
              <h2 className="font-bold">Create Workshop</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <span style={{fontSize: '1.25rem'}}>&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Select Module</label>
                <select className="form-input" required value={formData.module_id} onChange={(e) => setFormData({...formData, module_id: e.target.value})}>
                  <option value="" disabled>Select associated module...</option>
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Workshop Title</label>
                <input type="text" className="form-input" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Instructions (Desc)</label>
                <textarea className="form-input" rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Workshop Link (Resource/Demo URL)</label>
                <input type="url" className="form-input" placeholder="https://..." value={formData.web_page} onChange={(e) => setFormData({...formData, web_page: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Workshop</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherWorkshops;
