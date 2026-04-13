import React, { useState, useEffect } from 'react';
import { GraduationCap, ExternalLink, Plus, Upload, X, Video, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
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
  const [existingSubmission, setExistingSubmission] = useState(null);

  const [selectedGroupId, setSelectedGroupId] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const groups = await studentService.getMyGroups();
      if (groups.length > 0) {
        const firstGroupId = groups[0].id;
        setSelectedGroupId(firstGroupId);
        await fetchTeams(firstGroupId);
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const fetchTeams = async (groupId) => {
    try {
      const data = await pfeService.getTeams(groupId || selectedGroupId);
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
    if (!selectedGroupId) {
      alert("You need to be in a group to create a team.");
      return;
    }
    try {
      await pfeService.createTeam({ group_id: selectedGroupId, name: newTeamName });
      setShowCreateTeam(false);
      setNewTeamName('');
      fetchTeams(selectedGroupId);
    } catch {
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

  const handleOpenSubmissionModal = async () => {
    if (!formData.pfe_team_id) {
      alert('Please join or create a team first!');
      return;
    }

    try {
      const existing = await pfeService.getTeamSubmissions(formData.pfe_team_id);
      const current = Array.isArray(existing) ? existing[0] : existing;

      if (current) {
        setExistingSubmission(current);
        setFormData(prev => ({
          ...prev,
          project_title: current.project_title || '',
          description: current.description || '',
          project_repo: current.project_repo || '',
          project_demo: current.project_demo || '',
          explanation_video: current.explanation_video || '',
          report_pdf: current.report_pdf || ''
        }));
      } else {
        setExistingSubmission(null);
      }
    } catch (e) {
      console.error('Failed to fetch existing PFE submission:', e);
      setExistingSubmission(null);
    }

    setShowModal(true);
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
      setExistingSubmission(null);
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
        <div className="page-header__actions">
          <button type="button" className="btn btn-secondary" onClick={() => setShowCreateTeam(true)}>
            <Plus size={18} /> Create Team
          </button>
          <button type="button" className="btn btn-primary" onClick={handleOpenSubmissionModal}>
            <Upload size={18} /> {existingSubmission ? 'Modify PFE' : 'Submit PFE'}
          </button>
        </div>
      </div>

      <div className="grid-cards">
        {loading ? (
          <div className="loading-state">Loading PFE...</div>
        ) : teams.length === 0 ? (
          <div className="card-action" onClick={() => setShowCreateTeam(true)}>
            <div className="card-action__icon">
              <GraduationCap size={24} />
            </div>
            <h3 className="card-action__title">Create PFE Team</h3>
            <p className="card-action__text">Start your graduation project team</p>
          </div>
        ) : (
          <>
            {teams.map(team => {
              const isMember = team.members?.some(m => m.id === user?.id);
              return (
                <div key={team.id} className={`card card--col${isMember ? ' card--accent' : ''}`}>
                  <div>
                    <div className="card__head">
                      <div className="card__title-group">
                        <div className={`media-icon ${isMember ? 'media-icon--solid-primary' : 'media-icon--muted'}`}>
                          <GraduationCap size={20} />
                        </div>
                        {team.name}
                      </div>
                      {isMember && (
                        <span className="badge badge-success badge--trailing">
                           My Team
                        </span>
                      )}
                    </div>

                    <div className="card__body">
                      <div className="badge badge-primary badge--block">
                        {Array.isArray(team.members) ? team.members.length : (team.members || 0)} Students
                      </div>
                      <p className="card__muted">Final graduation project team</p>
                    </div>
                  </div>

                  <div className="card__footer">
                    {isMember ? (
                      <div className="card__stamp--primary">Joined & Active</div>
                    ) : (
                      <button type="button" className="btn btn-secondary btn--block" onClick={() => handleJoin(team.id)}>
                        Join Team
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="card-action" onClick={() => setShowCreateTeam(true)}>
              <Plus size={24} className="card-action__plus" />
              <span className="font-medium">Create Another Team</span>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">{existingSubmission ? 'Modify PFE Details' : 'Submit PFE Details'}</h2>
              <button type="button" className="modal-close" onClick={() => {
                setShowModal(false);
                setExistingSubmission(null);
              }} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="pfe-submission-form">
              {existingSubmission && (
                <div className="status-banner">Editing your existing PFE submission</div>
              )}
              <div className="form-group">
                <label className="form-label" htmlFor="pfe-team">Select Your Team</label>
                <select
                  id="pfe-team"
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
                <label className="form-label" htmlFor="pfe-title">Project Title</label>
                <input id="pfe-title" type="text" className="form-input" required value={formData.project_title} onChange={e => setFormData({...formData, project_title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="pfe-desc">Description</label>
                <textarea id="pfe-desc" className="form-input" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label form-label--inline-icon"><ExternalLink size={14}/> Repository URL</label>
                <input type="url" className="form-input" value={formData.project_repo} onChange={e => setFormData({...formData, project_repo: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label form-label--inline-icon"><ExternalLink size={14}/> Live Demo URL</label>
                <input type="url" className="form-input" value={formData.project_demo} onChange={e => setFormData({...formData, project_demo: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label form-label--inline-icon"><Video size={14}/> Explanation Video Link</label>
                <input type="url" className="form-input" placeholder="YouTube, Loom, etc." value={formData.explanation_video} onChange={e => setFormData({...formData, explanation_video: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label form-label--inline-icon"><FileText size={14}/> Final Report Link (URL)</label>
                <input type="url" className="form-input" placeholder="Google Drive, Dropbox, etc." value={formData.report_pdf} onChange={e => setFormData({...formData, report_pdf: e.target.value})} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowModal(false);
                  setExistingSubmission(null);
                }} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (existingSubmission ? 'Save Changes' : 'Submit PFE')}
                </button>
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
              <button type="button" className="modal-close" onClick={() => setShowCreateTeam(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTeam}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-pfe-team">Team Name</label>
                <input id="new-pfe-team" type="text" className="form-input" required value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="e.g. EduTrack Team" />
              </div>
              <div className="modal-footer">
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
