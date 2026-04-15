import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Upload, ExternalLink, Trash2, X, Edit2 } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { workshopService } from '../../services/workshopService';


const TeacherWorkshops = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modules, setModules] = useState([]);
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
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
    } catch {
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
    } catch {
      setWorkshops([{
        id: 1, title: 'Build an API', description: 'Node JS REST',
        module_id: 1, created_at: new Date().toISOString()
      }]);
    } finally {
      setSubLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ module_id: '', title: '', description: '', repo: '', pdf_report: '', web_page: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await workshopService.updateWorkshop(editingId, { ...formData, group_id: selectedGroup });
      } else {
        await workshopService.createWorkshop({ ...formData, group_id: selectedGroup });
      }
      setShowModal(false);
      resetForm();
      fetchWorkshops(selectedGroup);
    } catch (e) {
      console.error(e);
      alert('Failed to save workshop to database.');
    }
  };

  const handleEdit = (workshop) => {
    setEditingId(workshop.id);
    setFormData({
      module_id: workshop.module_id || '',
      title: workshop.title || '',
      description: workshop.description || '',
      repo: workshop.repo || '',
      pdf_report: workshop.pdf_report || '',
      web_page: workshop.web_page || ''
    });
    setShowModal(true);
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
        <button type="button" className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={18} /> Add Workshop
        </button>
      </div>

      <div className="card card--toolbar">
        <label className="card--toolbar__label" htmlFor="workshop-group">Select Group:</label>
        <div className="card--toolbar__fields">
          <select
            id="workshop-group"
            className="form-input form-input--compact-select"
            value={selectedGroup || ''}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name} - {g.year || ''}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-cards">
        {(loading || subLoading) ? (
          <div className="loading-state">Loading workshops...</div>
        ) : workshops.length === 0 ? (
          <div className="empty-state-card card">
            <BookOpen size={48} className="empty-state-card__icon" />
            <h3 className="empty-state-card__title">No Workshops Found</h3>
            <p>You haven&apos;t created any workshops for this group yet.</p>
          </div>
        ) : (
          <>
            {workshops.map(ws => (
              <div key={ws.id} className="card card--col">
                <div>
                  <div className="card__head">
                    <div className="card__title-group">
                      <div className="media-icon media-icon--primary">
                        <BookOpen size={20} />
                      </div>
                      {ws.title}
                    </div>
                  </div>

                  <div className="card__body">
                    <p className="card__desc">{ws.description || 'No description provided.'}</p>
                    <div className="card__muted">Created: {new Date(ws.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="card__footer">
                  <button type="button" className="btn btn-secondary btn--edit-row" onClick={() => navigate('/teacher/submissions', { state: { filterType: 'Workshops' } })}>
                    <Upload size={16} /> Submissions
                  </button>
                  <div className="card__footer-actions">
                    <button type="button" className="icon-action-btn" onClick={() => handleEdit(ws)} title="Edit Workshop">
                      <Edit2 size={18} />
                    </button>
                    {ws.web_page && (
                      <a href={ws.web_page} target="_blank" rel="noopener noreferrer" className="icon-action-btn" title="External Link">
                        <ExternalLink size={18} />
                      </a>
                    )}
                    <button type="button" className="icon-action-btn icon-action-btn--danger" onClick={() => handleDelete(ws.id)} title="Delete Workshop">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="card-action" onClick={() => { resetForm(); setShowModal(true); }}>
              <Plus size={24} className="card-action__plus" />
              <span className="font-medium">Add Another Workshop</span>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">{editingId ? 'Edit Workshop' : 'Create Workshop'}</h2>
              <button type="button" className="modal-close" onClick={() => { setShowModal(false); resetForm(); }} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="ws-module">Select Module</label>
                <select id="ws-module" className="form-input" required value={formData.module_id} onChange={(e) => setFormData({...formData, module_id: e.target.value})}>
                  <option value="" disabled>Select associated module...</option>
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ws-title">Workshop Title</label>
                <input id="ws-title" type="text" className="form-input" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ws-desc">Instructions (Desc)</label>
                <textarea id="ws-desc" className="form-input" rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ws-link">Workshop Link (Resource/Demo URL)</label>
                <input id="ws-link" type="url" className="form-input" placeholder="https://..." value={formData.web_page} onChange={(e) => setFormData({...formData, web_page: e.target.value})} />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Update Workshop' : 'Save Workshop'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherWorkshops;
