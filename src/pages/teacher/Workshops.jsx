import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Upload, ExternalLink, Trash2, X, Edit2 } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { workshopService } from '../../services/workshopService';
import { useTranslation } from 'react-i18next';
import { formatDate, formatAcademicYear } from '../../utils/locale';


const TeacherWorkshops = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || 'en';
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
      const errorMsg = e.response?.data?.message || t('teacher.workshops.saveFailed', { defaultValue: 'Failed to save workshop to database.' });
      alert(errorMsg);
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
      const errorMsg = e.response?.data?.message || t('teacher.workshops.deleteFailed', { defaultValue: 'Failed to delete workshop.' });
      alert(errorMsg);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('teacher.workshops.title', { defaultValue: 'Workshops' })}</h1>
          <p className="page-subtitle">{t('teacher.workshops.subtitle', { defaultValue: 'Assign workshops and review student code.' })}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={18} /> {t('teacher.workshops.addWorkshop', { defaultValue: 'Add Workshop' })}
        </button>
      </div>

      <div className="card card--toolbar">
        <label className="card--toolbar__label" htmlFor="workshop-group">{t('teacher.workshops.selectGroup', { defaultValue: 'Select Group:' })}</label>
        <div className="card--toolbar__fields">
          <select
            id="workshop-group"
            className="form-input form-input--compact-select"
            value={selectedGroup || ''}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name} - {formatAcademicYear(g.year)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-cards">
        {(loading || subLoading) ? (
          <div className="loading-state">{t('teacher.workshops.loading', { defaultValue: 'Loading workshops...' })}</div>
        ) : workshops.length === 0 ? (
          <div className="empty-state-card card">
            <BookOpen size={48} className="empty-state-card__icon" />
            <h3 className="empty-state-card__title">{t('teacher.workshops.emptyTitle', { defaultValue: 'No Workshops Found' })}</h3>
            <p>{t('teacher.workshops.emptyText', { defaultValue: "You haven't created any workshops for this group yet." })}</p>
          </div>
        ) : (
          <>
            {workshops.map(ws => (
              <div key={ws.id} className="card card--col">
                <div>
                  <div className="card__head">
                    <div className="card__title-group">
                      <div className={`media-icon media-icon--module ${!ws.logo_url ? 'media-icon--primary media-icon--bordered' : ''}`}>
                        {ws.logo_url ? (
                          <img src={ws.logo_url} alt="" className="media-icon__img" />
                        ) : (
                          <BookOpen size={20} />
                        )}
                      </div>
                      {ws.title}
                    </div>
                  </div>

                  <div className="card__body">
                    <p className="card__desc">{ws.description || t('teacher.workshops.noDescription', { defaultValue: 'No description provided.' })}</p>
                    <div className="card__muted">{t('teacher.workshops.created', { defaultValue: 'Created:' })} {formatDate(ws.created_at, language)}</div>
                  </div>
                </div>

                <div className="card__footer">
                  <button type="button" className="btn btn-secondary btn--edit-row" onClick={() => navigate('/teacher/submissions', { state: { filterType: 'Workshops' } })}>
                  <Upload size={16} /> {t('teacher.workshops.submissions', { defaultValue: 'Submissions' })}
                  </button>
                  <div className="card__footer-actions">
                    <button type="button" className="icon-action-btn" onClick={() => handleEdit(ws)} title={t('teacher.workshops.editWorkshop', { defaultValue: 'Edit Workshop' })}>
                      <Edit2 size={18} />
                    </button>
                    {ws.web_page && (
                      <a href={ws.web_page} target="_blank" rel="noopener noreferrer" className="icon-action-btn" title={t('teacher.workshops.externalLink', { defaultValue: 'External Link' })}>
                        <ExternalLink size={18} />
                      </a>
                    )}
                    <button type="button" className="icon-action-btn icon-action-btn--danger" onClick={() => handleDelete(ws.id)} title={t('teacher.workshops.deleteWorkshop', { defaultValue: 'Delete Workshop' })}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="card-action" onClick={() => { resetForm(); setShowModal(true); }}>
              <Plus size={24} className="card-action__plus" />
              <span className="font-medium">{t('teacher.workshops.addAnother', { defaultValue: 'Add Another Workshop' })}</span>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">{editingId ? t('teacher.workshops.editWorkshop', { defaultValue: 'Edit Workshop' }) : t('teacher.workshops.createWorkshop', { defaultValue: 'Create Workshop' })}</h2>
              <button type="button" className="modal-close" onClick={() => { setShowModal(false); resetForm(); }} aria-label={t('common.close')}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="ws-module">{t('teacher.workshops.selectModule', { defaultValue: 'Select Module' })}</label>
                <select id="ws-module" className="form-input" required value={formData.module_id} onChange={(e) => setFormData({...formData, module_id: e.target.value})}>
                  <option value="" disabled>{t('teacher.workshops.selectAssociatedModule', { defaultValue: 'Select associated module...' })}</option>
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ws-title">{t('teacher.workshops.workshopTitle', { defaultValue: 'Workshop Title' })}</label>
                <input id="ws-title" type="text" className="form-input" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ws-desc">{t('teacher.workshops.instructions', { defaultValue: 'Instructions (Desc)' })}</label>
                <textarea id="ws-desc" className="form-input" rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ws-link">{t('teacher.workshops.workshopLink', { defaultValue: 'Workshop Link (Resource/Demo URL)' })}</label>
                <input id="ws-link" type="url" className="form-input" placeholder="https://..." value={formData.web_page} onChange={(e) => setFormData({...formData, web_page: e.target.value})} />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>{t('teacher.workshops.cancel', { defaultValue: 'Cancel' })}</button>
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
