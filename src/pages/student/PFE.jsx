import React, { useState, useEffect } from 'react';
import { GraduationCap, ExternalLink, Plus, Upload, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { pfeService } from '../../services/pfeService';
import '../../styles/tables.css';

const StudentPFE = () => {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({ pfe_team_id: '', project_title: '', description: '', project_repo: '', project_demo: '', explanation_video: '', report_pdf: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      // For now, still using 1, but we should eventually get the student's real group ID
      const data = await pfeService.getTeams(1);
      setTeams(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, pfe_team_id: data[0].id }));
      }
    } catch (e) {
      console.error(e);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await pfeService.createTeam({ group_id: 1, name: newTeamName });
      setShowCreateTeam(false);
      setNewTeamName('');
      fetchTeams();
    } catch (e) {
      alert('Failed to create PFE team.');
    }
  };

  const handleJoin = async (id) => {
    try {
      await pfeService.joinTeam(id);
      alert('Joined PFE Team Successfully!');
    } catch (e) {
      if (e.response && e.response.status === 409) {
        alert('You are already a member of this team!');
      } else {
        alert('Failed to join team in database.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pfe_team_id) {
      alert('Please join or create a team first!');
      return;
    }
    setSubmitting(true);
    try {
      await pfeService.submitPfe(formData);
      setShowModal(false);
      setFormData(prev => ({ ...prev, project_title: '', description: '', project_repo: '', project_demo: '', explanation_video: '', report_pdf: '' }));
      alert('PFE submitted to database!');
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to submit to DB.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">PFE Portal</h1>
          <p className="page-subtitle">Manage your end-of-study project.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => setShowCreateTeam(true)}>
            <Plus size={18} /> Create Team
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Upload size={18} /> Submit PFE
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>PFE Team</th>
              <th>Members</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {(loading) ? (
              <tr><td colSpan="3" className="text-center text-muted py-4">Loading PFE...</td></tr>
            ) : teams.length === 0 ? (
              <tr><td colSpan="3" className="text-center text-muted py-4">No PFE teams found.</td></tr>
            ) : (
              teams.map(team => (
                <tr key={team.id}>
                  <td className="font-semibold flex items-center gap-2">
                    <GraduationCap size={16} className="text-primary-color" />
                    {team.name}
                  </td>
                  <td>{Array.isArray(team.members) ? team.members.length : (team.members || 0)} Students</td>
                  <td className="text-right">
                    {team.members?.some(m => m.id === user?.id) ? (
                      <span className="badge badge-success flex items-center gap-1 justify-end w-auto inline-flex">
                        <CheckCircle size={14}/> Joined
                      </span>
                    ) : (
                      <button className="btn btn-secondary w-auto text-sm py-1 px-3" onClick={() => handleJoin(team.id)}>
                        Join
                      </button>
                    )}
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
              <h2 className="font-bold">Submit PFE Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><span style={{fontSize: '1.25rem'}}>&times;</span></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Your Team</label>
                <select 
                  className="form-input" 
                  required 
                  value={formData.pfe_team_id} 
                  onChange={e => setFormData({...formData, pfe_team_id: e.target.value})}
                >
                  <option value="" disabled>Select a team...</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input type="text" className="form-input" required value={formData.project_title} onChange={e => setFormData({...formData, project_title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label flex items-center gap-1"><ExternalLink size={14}/> Repository URL</label>
                <input type="url" className="form-input" value={formData.project_repo} onChange={e => setFormData({...formData, project_repo: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label flex items-center gap-1"><ExternalLink size={14}/> Live Demo URL</label>
                <input type="url" className="form-input" value={formData.project_demo} onChange={e => setFormData({...formData, project_demo: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit PFE'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showCreateTeam && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">Create PFE Team</h2>
              <button className="modal-close" onClick={() => setShowCreateTeam(false)}><span style={{fontSize: '1.25rem'}}>&times;</span></button>
            </div>
            <form onSubmit={handleCreateTeam}>
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input type="text" className="form-input" required value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="e.g. EduTrack Team" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateTeam(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Team</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPFE;
