import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, BookOpen } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/locale';


const Modules = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || 'en';
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
      alert(t('teacher.modules.saveFailed', { defaultValue: 'Failed to save to database. Please check your connection.' }));
    }
  };

  const handleEdit = (mod) => {
    setFormData({ title: mod.title, description: mod.description || '' });
    setEditingId(mod.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('teacher.modules.deleteConfirm', { defaultValue: 'Are you sure you want to delete this module?' }))) {
      try {
        await teacherService.deleteModule(id);
        fetchModules();
      } catch (e) {
        console.error(e);
        alert(t('teacher.modules.deleteFailed', { defaultValue: 'Failed to delete module.' }));
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('teacher.modules.title', { defaultValue: 'Modules' })}</h1>
          <p className="page-subtitle">{t('teacher.modules.subtitle', { defaultValue: 'Manage your teaching modules.' })}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({title: '', description: ''}); setShowModal(true); }}>
          <Plus size={18} /> {t('teacher.modules.newModule', { defaultValue: 'New Module' })}
        </button>
      </div>

      <div className="grid-cards">
        {loading ? (
          <div className="loading-state">{t('teacher.modules.loading', { defaultValue: 'Loading modules...' })}</div>
        ) : modules.length === 0 ? (
          <div className="card-action" onClick={() => { setEditingId(null); setFormData({title: '', description: ''}); setShowModal(true); }}>
            <div className="card-action__icon">
              <BookOpen size={24} />
            </div>
            <h3 className="card-action__title">{t('teacher.modules.createFirstTitle', { defaultValue: 'Create Your First Module' })}</h3>
            <p className="card-action__text">{t('teacher.modules.createFirstText', { defaultValue: 'Organize your course content and workshops' })}</p>
          </div>
        ) : (
          <>
            {modules.map(mod => (
              <div key={mod.id} className="card card--col">
                <div>
                  <div className="card__head">
                    <div className="card__title-group">
                      <div className="media-icon media-icon--primary">
                        <BookOpen size={20} />
                      </div>
                      {mod.title}
                    </div>
                  </div>

                  <div className="card__body">
                    <p className="card__desc">{mod.description || t('teacher.modules.noDescription', { defaultValue: 'No description provided.' })}</p>
                    <div className="card__muted">{t('teacher.modules.created', { defaultValue: 'Created:' })} {formatDate(mod.created_at, language)}</div>
                  </div>
                </div>

                <div className="card__footer">
                  <button type="button" className="btn btn-secondary btn--edit-row" onClick={() => handleEdit(mod)}>
                    <Edit2 size={16} /> {t('teacher.modules.edit', { defaultValue: 'Edit' })}
                  </button>
                  <button type="button" className="icon-action-btn icon-action-btn--danger" onClick={() => handleDelete(mod.id)} title={t('teacher.modules.deleteModule', { defaultValue: 'Delete Module' })}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            <div className="card-action" onClick={() => { setEditingId(null); setFormData({title: '', description: ''}); setShowModal(true); }}>
              <Plus size={24} className="card-action__plus" />
              <span className="font-medium">{t('teacher.modules.addAnother', { defaultValue: 'Add Another Module' })}</span>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">{editingId ? t('teacher.modules.editModule', { defaultValue: 'Edit Module' }) : t('teacher.modules.createModule', { defaultValue: 'Create Module' })}</h2>
              <button type="button" className="modal-close" onClick={() => { setShowModal(false); setEditingId(null); setFormData({title: '', description: ''}); }}><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">{t('teacher.modules.moduleTitle', { defaultValue: 'Module Title' })}</label>
                <input
                  type="text"
                  id="title"
                  className="form-input"
                  required
                  placeholder={t('teacher.modules.titlePlaceholder', { defaultValue: 'e.g. Database Design' })}
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="description">{t('teacher.modules.descriptionOptional', { defaultValue: 'Description (Optional)' })}</label>
                <textarea
                  id="description"
                  className="form-input"
                  placeholder="..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingId(null); setFormData({title: '', description: ''}); }}>{t('teacher.modules.cancel', { defaultValue: 'Cancel' })}</button>
                <button type="submit" className="btn btn-primary">{editingId ? t('teacher.modules.updateModule', { defaultValue: 'Update Module' }) : t('teacher.modules.saveModule', { defaultValue: 'Save Module' })}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modules;
