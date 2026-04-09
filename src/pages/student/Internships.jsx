import React, { useState, useEffect } from 'react';
import { FileBox, Building, Plus } from 'lucide-react';
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
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Internship
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Supervisor</th>
              <th>Time Period</th>
            </tr>
          </thead>
          <tbody>
            {(loading) ? (
              <tr><td colSpan="3" className="text-center text-muted py-4">Loading...</td></tr>
            ) : internships.length === 0 ? (
              <tr><td colSpan="3" className="text-center text-muted py-4">No internship recorded yet.</td></tr>
            ) : (
              internships.map(intern => (
                <tr key={intern.id}>
                  <td className="font-semibold flex items-center gap-2">
                    <Building size={16} className="text-primary-color" />
                    {intern.company_name}
                  </td>
                  <td>{intern.supervisor_name}</td>
                  <td>{new Date(intern.start_date).toLocaleDateString()} to {new Date(intern.end_date).toLocaleDateString()}</td>
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
              <h2 className="font-bold">Register Internship</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><span style={{fontSize: '1.25rem'}}>&times;</span></button>
            </div>
            
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input type="text" className="form-input" required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Supervisor Name</label>
                <input type="text" className="form-input" required value={formData.supervisor_name} onChange={e => setFormData({...formData, supervisor_name: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <div className="form-group flex-1">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
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
