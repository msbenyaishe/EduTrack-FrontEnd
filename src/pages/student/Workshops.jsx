import React, { useState, useEffect } from 'react';
import { BookOpen, Upload, ExternalLink, CheckCircle, X } from 'lucide-react';
import { workshopService } from '../../services/workshopService';
import { useTranslation } from 'react-i18next';


const StudentWorkshops = () => {
  const { t } = useTranslation();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);

  const [formData, setFormData] = useState({ repo: '', web_page: '', pdf_report: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkshops();
  }, [t]);

  const fetchWorkshops = async () => {
    try {
      const data = await workshopService.getStudentWorkshops();
      setWorkshops(data);
    } catch {
      setWorkshops([
        { id: 1, title: t('student.workshops.sampleTitle1', { defaultValue: 'Build React App' }), module: 'Web Dev', teacher: 'Mr. Smith', submitted: true },
        { id: 2, title: t('student.workshops.sampleTitle2', { defaultValue: 'MongoDB Aggregation' }), module: 'Database Design', teacher: 'Mrs. Davis', submitted: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmit = (ws) => {
    setFormData({
      repo: ws.submitted_repo || '',
      web_page: ws.submitted_web_page || '',
      pdf_report: ws.submitted_pdf_report || ''
    });
    setSelectedWorkshop(ws);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await workshopService.submitWorkshop({ ...formData, workshop_id: selectedWorkshop.id });
      alert(response.message || t('student.workshops.submitSuccess', { defaultValue: 'Workshop submitted successfully!' }));
      fetchWorkshops();
      setFormData({ repo: '', web_page: '', pdf_report: '' });
      setShowModal(false);
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.message || t('student.workshops.submitFailed', { defaultValue: 'Failed to submit workshop to database.' });
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('student.workshops.title', { defaultValue: 'Assigned Workshops' })}</h1>
          <p className="page-subtitle">{t('student.workshops.subtitle', { defaultValue: 'View and submit assignments from your modules.' })}</p>
        </div>
      </div>

      <div className="grid-cards">
        {loading ? (
          <div className="loading-state">{t('student.workshops.loading', { defaultValue: 'Loading workshops...' })}</div>
        ) : workshops.length === 0 ? (
          <div className="empty-state-card card">
            <BookOpen size={48} className="empty-state-card__icon" />
            <h3 className="empty-state-card__title">{t('student.workshops.emptyTitle', { defaultValue: 'No Workshops Found' })}</h3>
            <p>{t('student.workshops.emptyText', { defaultValue: "You don't have any assigned workshops yet." })}</p>
          </div>
        ) : (
          workshops.map(ws => (
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
                  {!!ws.submitted && (
                    <span className="badge badge-success badge--trailing">
                      <CheckCircle size={14} className="btn__icon-left" /> {t('student.workshops.submitted', { defaultValue: 'Submitted' })}
                    </span>
                  )}
                </div>

                <div className="card__body">
                  <div className="card__emphasis">{ws.module}</div>
                  <div className="card__teacher-line"><strong>{t('student.workshops.teacherLabel', { defaultValue: 'Teacher:' })}</strong> {ws.teacher}</div>
                </div>
              </div>

              <div className="card__footer card__footer--stack">
                {ws.web_page && (
                  <a
                    href={ws.web_page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn--block"
                  >
                    <ExternalLink size={16} /> {t('student.workshops.viewExternalLink', { defaultValue: 'View External Link' })}
                  </a>
                )}

                <button
                  type="button"
                  className="btn btn-primary btn--block"
                  onClick={() => handleOpenSubmit(ws)}
                >
                  <Upload size={16} /> {ws.submitted ? t('student.workshops.modifySubmission', { defaultValue: 'Modify Submission' }) : t('student.workshops.submitWork', { defaultValue: 'Submit Work' })}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">{selectedWorkshop?.submitted ? t('student.workshops.modifySubmission', { defaultValue: 'Modify Submission' }) : t('student.workshops.submit', { defaultValue: 'Submit' })}: {selectedWorkshop?.title}</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label={t('common.close')}>
                <X size={20} />
              </button>
            </div>
            <p className="modal-hint">
              {t('student.workshops.modalHint', { defaultValue: 'Fill in at least one field to submit your workshop. Links must be valid URLs.' })}
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label form-label--inline-icon"><ExternalLink size={14}/>{t('student.workshops.repositoryUrl', { defaultValue: 'Repository URL' })}</label>
                <input type="url" className="form-input" placeholder="https://github.com/..." value={formData.repo} onChange={(e) => setFormData({...formData, repo: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label form-label--inline-icon"><ExternalLink size={14}/>{t('student.workshops.liveDemoUrl', { defaultValue: 'Live Demo URL' })}</label>
                <input type="url" className="form-input" placeholder="https://..." value={formData.web_page} onChange={(e) => setFormData({...formData, web_page: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label form-label--inline-icon"><ExternalLink size={14}/>{t('student.workshops.pdfReportUrl', { defaultValue: 'PDF Report URL' })}</label>
                <input type="url" className="form-input" placeholder="https://drive.google.com/..." value={formData.pdf_report} onChange={(e) => setFormData({...formData, pdf_report: e.target.value})} />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>{t('student.workshops.cancel', { defaultValue: 'Cancel' })}</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || (!formData.repo && !formData.web_page && !formData.pdf_report)}>
                  {submitting ? t('student.workshops.saving', { defaultValue: 'Saving...' }) : (selectedWorkshop?.submitted ? t('student.workshops.saveChanges', { defaultValue: 'Save Changes' }) : t('student.workshops.submit', { defaultValue: 'Submit' }))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentWorkshops;
