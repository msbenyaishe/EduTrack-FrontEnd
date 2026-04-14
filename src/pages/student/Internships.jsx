import React, { useState, useEffect } from 'react';
import { Building, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { internshipService } from '../../services/internshipService';
import '../../styles/tables.css';

const StudentInternships = () => {
  const [formData, setFormData] = useState({ company_name: '', supervisor_name: '', start_date: '', end_date: '' });
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInternshipId, setCurrentInternshipId] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await internshipService.updateInternship(currentInternshipId, formData);
      } else {
        await internshipService.submitInternship(formData);
      }
      handleCloseModal();
      fetchInternships();
    } catch (e) {
      console.error('Failed to save internship', e.response?.data || e.message);
      alert('Failed to save to database. Check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (intern) => {
    setFormData({
      company_name: intern.company_name,
      supervisor_name: intern.supervisor_name,
      start_date: new Date(intern.start_date).toISOString().split('T')[0],
      end_date: new Date(intern.end_date).toISOString().split('T')[0]
    });
    setCurrentInternshipId(intern.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this internship?')) return;
    try {
      await internshipService.deleteInternship(id);
      fetchInternships();
    } catch (e) {
      console.error('Failed to delete internship', e);
      alert('Failed to delete. Check connection.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentInternshipId(null);
    setFormData({ company_name: '', supervisor_name: '', start_date: '', end_date: '' });
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

                <div className="card__footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="card__stamp">Active Internship</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => handleEditClick(intern)} title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button type="button" className="btn btn-danger" style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }} onClick={() => handleDeleteClick(intern.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
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
              <h2 className="font-bold">{isEditing ? 'Edit Internship' : 'Register Internship'}</h2>
              <button type="button" className="modal-close" onClick={handleCloseModal} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
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
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={submitting}>Cancel</button>
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
