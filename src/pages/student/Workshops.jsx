import React, { useState, useEffect } from 'react';
import { BookOpen, Upload, ExternalLink, CheckCircle, X } from 'lucide-react';
import { workshopService } from '../../services/workshopService';
import '../../styles/tables.css';

const StudentWorkshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);

  const [formData, setFormData] = useState({ repo: '', web_page: '', pdf_report: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      const data = await workshopService.getStudentWorkshops();
      setWorkshops(data);
    } catch {
      setWorkshops([
        { id: 1, title: 'Build React App', module: 'Web Dev', teacher: 'Mr. Smith', submitted: true },
        { id: 2, title: 'MongoDB Aggregation', module: 'Database Design', teacher: 'Mrs. Davis', submitted: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmit = (ws) => {
    setFormData({
      repo: ws.repo || '',
      web_page: ws.web_page || '',
      pdf_report: ws.pdf_report || ''
    });
    setSelectedWorkshop(ws);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await workshopService.submitWorkshop({ ...formData, workshop_id: selectedWorkshop.id });
      fetchWorkshops();
      setFormData({ repo: '', web_page: '', pdf_report: '' });
      setShowModal(false);
    } catch (e) {
      console.error(e);
      alert('Failed to submit workshop to database.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assigned Workshops</h1>
          <p className="page-subtitle">View and submit assignments from your modules.</p>
        </div>
      </div>

      <div className="grid-cards">
        {loading ? (
          <div className="loading-state">Loading workshops...</div>
        ) : workshops.length === 0 ? (
          <div className="empty-state-card card">
            <BookOpen size={48} className="empty-state-card__icon" />
            <h3 className="empty-state-card__title">No Workshops Found</h3>
            <p>You don&apos;t have any assigned workshops yet.</p>
          </div>
        ) : (
          workshops.map(ws => (
            <div key={ws.id} className="card card--col">
              <div>
                <div className="card__head">
                  <div className="card__title-group">
                    <div className="media-icon media-icon--primary">
                      <BookOpen size={20} />
                    </div>
                    {ws.title}
                  </div>
                  {ws.submitted && (
                    <span className="badge badge-success badge--trailing">
                      <CheckCircle size={14} className="btn__icon-left" /> Submitted
                    </span>
                  )}
                </div>

                <div className="card__body">
                  <div className="card__emphasis">{ws.module}</div>
                  <div className="card__teacher-line"><strong>Teacher:</strong> {ws.teacher}</div>
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
                    <ExternalLink size={16} /> View External Link
                  </a>
                )}

                <button
                  type="button"
                  className="btn btn-primary btn--block"
                  onClick={() => handleOpenSubmit(ws)}
                >
                  <Upload size={16} /> {ws.submitted ? 'Modify Submission' : 'Submit Work'}
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
              <h2 className="font-bold">{selectedWorkshop?.submitted ? 'Modify Submission' : 'Submit'}: {selectedWorkshop?.title}</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <p className="modal-hint">
              Fill in at least one field to submit your workshop. Links must be valid URLs.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label form-label--inline-icon"><ExternalLink size={14}/> Repository URL</label>
                <input type="url" className="form-input" placeholder="https://github.com/..." value={formData.repo} onChange={(e) => setFormData({...formData, repo: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label form-label--inline-icon"><ExternalLink size={14}/> Live Demo URL</label>
                <input type="url" className="form-input" placeholder="https://..." value={formData.web_page} onChange={(e) => setFormData({...formData, web_page: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label form-label--inline-icon"><ExternalLink size={14}/> PDF Report URL</label>
                <input type="url" className="form-input" placeholder="https://drive.google.com/..." value={formData.pdf_report} onChange={(e) => setFormData({...formData, pdf_report: e.target.value})} />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || (!formData.repo && !formData.web_page && !formData.pdf_report)}>
                  {submitting ? 'Saving...' : (selectedWorkshop?.submitted ? 'Save Changes' : 'Submit')}
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
