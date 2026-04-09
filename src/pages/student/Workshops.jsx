import React, { useState, useEffect } from 'react';
import { BookOpen, Upload, ExternalLink, CheckCircle } from 'lucide-react';
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
    } catch (e) {
      setWorkshops([
        { id: 1, title: 'Build React App', module: 'Web Dev', teacher: 'Mr. Smith', submitted: true },
        { id: 2, title: 'MongoDB Aggregation', module: 'Database Design', teacher: 'Mrs. Davis', submitted: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmit = (ws) => {
    setSelectedWorkshop(ws);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await workshopService.submitWorkshop({ ...formData, workshop_id: selectedWorkshop.id });
      fetchWorkshops();
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

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Module</th>
              <th>Teacher</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(loading) ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">Loading...</td></tr>
            ) : workshops.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">No active workshops.</td></tr>
            ) : (
              workshops.map(ws => (
                <tr key={ws.id}>
                  <td className="font-semibold flex items-center gap-2">
                    <BookOpen size={16} className="text-primary-color" />
                    {ws.title}
                  </td>
                  <td>{ws.module}</td>
                  <td>{ws.teacher}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {ws.web_page && (
                        <a 
                          href={ws.web_page} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-secondary"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                        >
                          <ExternalLink size={14} style={{ marginRight: '0.25rem' }}/> View Link
                        </a>
                      )}
                      {ws.submitted ? (
                        <span className="badge badge-success flex items-center gap-1 justify-end w-auto inline-flex">
                          <CheckCircle size={14}/> Submitted
                        </span>
                      ) : (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => handleOpenSubmit(ws)}
                        >
                          <Upload size={14} style={{ marginRight: '0.25rem' }}/> Submit Work
                        </button>
                      )}
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
              <h2 className="font-bold">Submit: {selectedWorkshop?.title}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><span style={{fontSize: '1.25rem'}}>&times;</span></button>
            </div>
            <p className="text-muted mb-4" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Fill in at least one field to submit your workshop. Links must be valid URLs.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label flex items-center gap-1"><ExternalLink size={14}/> Repository URL</label>
                <input type="url" className="form-input" placeholder="https://github.com/..." value={formData.repo} onChange={(e) => setFormData({...formData, repo: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label flex items-center gap-1"><ExternalLink size={14}/> Live Demo URL</label>
                <input type="url" className="form-input" placeholder="https://..." value={formData.web_page} onChange={(e) => setFormData({...formData, web_page: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label flex items-center gap-1"><ExternalLink size={14}/> PDF Report URL</label>
                <input type="url" className="form-input" placeholder="https://drive.google.com/..." value={formData.pdf_report} onChange={(e) => setFormData({...formData, pdf_report: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || (!formData.repo && !formData.web_page && !formData.pdf_report)}>
                  {submitting ? 'Submitting...' : 'Submit'}
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
