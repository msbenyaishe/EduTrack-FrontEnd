import React, { useState, useEffect } from 'react';
import { Building, Plus, X } from 'lucide-react';
import { internshipService } from '../../services/internshipService';
import '../../styles/tables.css';

const StudentInternships = () => {
  const [formData, setFormData] = useState({ company_name: '', supervisor_name: '', start_date: '', end_date: '' });
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const data = await internshipService.getStudentInternships();
      setInternships(Array.isArray(data) ? data : (data ? [data] : []));
    } catch (e) {
      console.error(e);
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await internshipService.submitInternship(formData);
      setShowModal(false);
      setFormData({ company_name: '', supervisor_name: '', start_date: '', end_date: '' });
      fetchInternships();
    } catch (e) {
      console.error('Failed to submit internship', e.response?.data || e.message);
      alert('Failed to save to database. Check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Internships</h1>
          <p className="page-subtitle">Submit and review your internship paperwork.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Internship
        </button>
      </div>

      <div className="grid-cards">
        {loading ? (
          <div className="loading-state">Loading internships...</div>
        ) : internships.length === 0 ? (
          <div className="card-action" onClick={() => setShowModal(true)}>
            <div className="card-action__icon">
              <Building size={24} />
            </div>
            <h3 className="card-action__title">Register Internship</h3>
            <p className="card-action__text">Submit your first internship paperwork</p>
          </div>
        ) : (
          <>
            {internships.map(intern => (
              <div key={intern.id} className="card card--col">
                <div>
                  <div className="card__head">
                    <div className="card__title-group">
                      <div className="media-icon media-icon--primary">
                        <Building size={20} />
                      </div>
                      {intern.company_name}
                    </div>
                  </div>

                  <div className="card__body">
                    <div className="card__emphasis">Supervisor: {intern.supervisor_name}</div>
                    <div className="date-range">
                       <span className="badge badge-primary">{new Date(intern.start_date).toLocaleDateString()}</span>
                       <span>to</span>
                       <span className="badge badge-primary">{new Date(intern.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="card__footer">
                  <div className="card__stamp">Active Internship</div>
                </div>
              </div>
            ))}

            <div className="card-action" onClick={() => setShowModal(true)}>
              <Plus size={24} className="card-action__plus" />
              <span className="font-medium">Add Another Internship</span>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">Register Internship</h2>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label" htmlFor="co-name">Company Name</label>
                <input id="co-name" type="text" className="form-input" required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="supervisor">Supervisor Name</label>
                <input id="supervisor" type="text" className="form-input" required value={formData.supervisor_name} onChange={e => setFormData({...formData, supervisor_name: e.target.value})} />
              </div>
              <div className="form-row-split">
                <div className="form-group">
                  <label className="form-label" htmlFor="start-d">Start Date</label>
                  <input id="start-d" type="date" className="form-input" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="end-d">End Date</label>
                  <input id="end-d" type="date" className="form-input" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Internship'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInternships;
