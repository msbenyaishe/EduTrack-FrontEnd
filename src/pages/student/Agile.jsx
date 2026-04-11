import React, { useState, useEffect } from 'react';
import { Users, Plus, Layout, CheckCircle, Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { agileService } from '../../services/agileService';
import { studentService } from '../../services/studentService';
import '../../styles/tables.css';

const StudentAgile = () => {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const { user } = useAuth();
  
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState('');

  const [myGroups, setMyGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [userInTeam, setUserInTeam] = useState(false);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [teamToRename, setTeamToRename] = useState(null); // { id, name }
  const [newTeamName, setNewTeamName] = useState('');

  const [showMembersModal, setShowMembersModal] = useState(false);
  const [teamMembersList, setTeamMembersList] = useState([]);
  const [viewingTeamName, setViewingTeamName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [isUserTeamMember, setIsUserTeamMember] = useState(false);

  // Sprint Submission State
  const [showSprintsModal, setShowSprintsModal] = useState(false);
  const [groupSprints, setGroupSprints] = useState([]);
  const [teamSubmissions, setTeamSubmissions] = useState([]);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({
    sprintId: null,
    repo: '',
    web_page: '',
    pdf_report: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const groups = await studentService.getMyGroups();
      setMyGroups(groups);
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
      const data = await agileService.getTeams(groupId || selectedGroupId);
      setTeams(data);
      // Check if user is in any team
      const inTeam = data.some(t => t.members?.some(m => Number(m.id) === Number(user?.id)));
      setUserInTeam(inTeam);
    } catch (e) {
      console.error(e);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedGroupId) {
      alert("You need to be in a group to create a team.");
      return;
    }
    if (userInTeam) {
      alert("You are already a member of an Agile team in this group.");
      return;
    }
    try {
      await agileService.createTeam({ group_id: selectedGroupId, name: teamName });
      setShowCreate(false);
      setTeamName('');
      fetchTeams(selectedGroupId);
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.message || e.response?.data?.error || 'Failed to create team.';
      alert(errorMsg);
    }
  };

  const handleJoin = async (id) => {
    if (userInTeam) {
      alert("You are already a member of an Agile team in this group.");
      return;
    }
    try {
      await agileService.joinTeam(id);
      alert('Joined Team Successfully!');
      fetchTeams(selectedGroupId);
    } catch (e) {
      if (e.response && e.response.status === 409) {
        alert('You are already a member of this team!');
      } else {
        console.error(e);
        const errorMsg = e.response?.data?.message || 'Failed to join team.';
        alert(errorMsg);
      }
    }
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team? This action cannot be undone.")) return;
    try {
      await agileService.deleteTeam(teamId);
      alert("Team deleted successfully.");
      fetchTeams(selectedGroupId);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to delete team.");
    }
  };

  const handleRenameClick = (team) => {
    setTeamToRename(team);
    setNewTeamName(team.name);
    setShowRenameModal(true);
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!newTeamName || newTeamName === teamToRename.name) {
      setShowRenameModal(false);
      return;
    }
    try {
      await agileService.updateTeam(teamToRename.id, newTeamName);
      setShowRenameModal(false);
      fetchTeams(selectedGroupId);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to rename team.");
    }
  };

  const handleViewMembers = async (team) => {
    setSelectedTeam(team);
    setTeamMembersList(team.members || []);
    setViewingTeamName(team.name);
    
    const isMember = team.members?.some(m => Number(m.id) === Number(user?.id)) || user?.role === 'teacher';
    setIsUserTeamMember(isMember);
    
    if (isMember) {
      try {
        const classmates = await agileService.getClassmates(selectedGroupId);
        // Filter out students already in ANY team
        const allMemberIds = new Set();
        teams.forEach(t => t.members?.forEach(m => allMemberIds.add(Number(m.id))));
        
        const freeStudents = classmates.filter(c => !allMemberIds.has(Number(c.id)));
        setAvailableStudents(freeStudents);
      } catch (e) {
        console.error("Failed to fetch classmates:", e);
      }
    }
    
    setShowMembersModal(true);
  };

  const handleAddMember = async (studentId) => {
    try {
      await agileService.addMember(selectedTeam.id, studentId);
      // Refresh
      const updatedTeams = await agileService.getTeams(selectedGroupId);
      setTeams(updatedTeams);
      const thisTeam = updatedTeams.find(t => t.id === selectedTeam.id);
      setTeamMembersList(thisTeam.members || []);
      // Update available students
      setAvailableStudents(prev => prev.filter(s => Number(s.id) !== Number(studentId)));
    } catch (e) {
      alert(e.response?.data?.message || "Failed to add member.");
    }
  };

  const handleRemoveMember = async (studentId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await agileService.removeMember(selectedTeam.id, studentId);
      // Refresh
      const updatedTeams = await agileService.getTeams(selectedGroupId);
      setTeams(updatedTeams);
      const thisTeam = updatedTeams.find(t => t.id === selectedTeam.id);
      setTeamMembersList(thisTeam.members || []);
      // Fetch classmates again to update available list if needed
      if (isUserTeamMember) {
        const classmates = await agileService.getClassmates(selectedGroupId);
        const allMemberIds = new Set();
        updatedTeams.forEach(t => t.members?.forEach(m => allMemberIds.add(Number(m.id))));
        setAvailableStudents(classmates.filter(c => !allMemberIds.has(Number(c.id))));
      }
    } catch (e) {
      alert(e.response?.data?.message || "Failed to remove member.");
    }
  };

  const handleViewSprints = async (team) => {
    setSelectedTeam(team);
    setShowSprintsModal(true);
    setLoadingSprints(true);
    try {
      const sprintsData = await agileService.getSprintsByGroup(selectedGroupId);
      setGroupSprints(sprintsData);
      const subsData = await agileService.getTeamSubmissions(team.id);
      setTeamSubmissions(subsData);
    } catch (e) {
      console.error("Failed to fetch sprints/submissions:", e);
    } finally {
      setLoadingSprints(false);
    }
  };

  const handleSubmissionChange = (field, value) => {
    setSubmissionForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitSprint = async (e) => {
    e.preventDefault();
    try {
      await agileService.submitSprint(submissionForm.sprintId, {
        agile_team_id: selectedTeam.id,
        repo: submissionForm.repo,
        web_page: submissionForm.web_page,
        pdf_report: submissionForm.pdf_report
      });
      alert("Sprint submitted successfully!");
      // Reset and refresh
      setSubmissionForm({ sprintId: null, repo: '', web_page: '', pdf_report: '' });
      const subsData = await agileService.getTeamSubmissions(selectedTeam.id);
      setTeamSubmissions(subsData);
    } catch (e) {
      alert(e.response?.data?.message || "Failed to submit sprint.");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Agile Teams</h1>
          <p className="page-subtitle">Join or create a team to submit sprints.</p>
        </div>
        {!userInTeam && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={18} /> Create Team
          </button>
        )}
      </div>

      {userInTeam && (
        <div className="alert alert-info" style={{ marginBottom: '1.5rem', backgroundColor: '#e3f2fd', color: '#0d47a1', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layout size={18} />
          <span>You are already part of an Agile team. You cannot create or join another team in this group.</span>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Members</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {(loading) ? (
              <tr><td colSpan="3" className="text-center text-muted py-4">Loading teams...</td></tr>
            ) : teams.length === 0 ? (
              <tr><td colSpan="3" className="text-center text-muted py-4">No agile teams found.</td></tr>
            ) : (
              teams.map(team => {
                const isMember = team.members?.some(m => Number(m.id) === Number(user?.id));
                return (
                  <tr key={team.id}>
                    <td>
                      <div className="table-cell-flex font-semibold">
                        <Users size={16} className="text-primary-color" />
                        {team.name}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="badge badge-primary hover:opacity-80 transition-opacity cursor-pointer border-none"
                        onClick={() => handleViewMembers(team)}
                        style={{ background: 'var(--primary-light)', color: 'var(--primary-color)' }}
                      >
                        <Users size={14} className="mr-1" />
                        {team.members?.length || 0} Members
                      </button>
                    </td>
                    <td className="text-right">
                      {isMember ? (
                        <div className="flex justify-end items-center gap-2">
                          <span className="badge badge-success flex items-center gap-1 w-auto inline-flex mr-2">
                            <CheckCircle size={14}/> My Team
                          </span>
                          <button 
                            className="icon-btn" 
                            onClick={() => handleRenameClick(team)}
                            title="Rename Team"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            className="icon-btn" 
                            onClick={() => handleViewSprints(team)}
                            title="View Sprints"
                          >
                            <Layout size={18} />
                          </button>
                          <button 
                            className="icon-btn icon-btn-danger" 
                            onClick={() => handleDelete(team.id)}
                            title="Delete Team"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="btn btn-secondary w-auto gap-1 text-sm py-1 px-3" 
                          onClick={() => handleJoin(team.id)}
                          disabled={userInTeam}
                          style={userInTeam ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                          Join Team
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
         <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">Create New Team</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}><span style={{fontSize: '1.25rem'}}>&times;</span></button>
            </div>
            
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input type="text" className="form-input" required value={teamName} onChange={(e) => setTeamName(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showRenameModal && (
         <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="font-bold">Rename Team</h2>
              <button className="modal-close" onClick={() => setShowRenameModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleRenameSubmit}>
              <div className="form-group">
                <label className="form-label">New Team Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={newTeamName} 
                  onChange={(e) => setNewTeamName(e.target.value)} 
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRenameModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showMembersModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="font-bold flex items-center gap-2">
                <Users size={20} className="text-primary-color" />
                {viewingTeamName} Members
              </h2>
              <button className="modal-close" onClick={() => setShowMembersModal(false)}><X size={20} /></button>
            </div>
            
            <div className="flex flex-col gap-3 mt-2" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {teamMembersList.length > 0 ? (
                teamMembersList.map((member, idx) => (
                  <div key={member.id || idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-color text-white flex items-center justify-center font-bold text-xs">
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{member.name}</div>
                        <div className="text-xs text-muted">{member.email}</div>
                      </div>
                    </div>
                    {isUserTeamMember && Number(member.id) !== Number(user?.id) && (
                      <button 
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        onClick={() => handleRemoveMember(member.id)}
                        title="Remove Member"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted italic">No members in this team yet.</div>
              )}
            </div>

            {isUserTeamMember && availableStudents.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <label className="form-label text-xs uppercase tracking-wider text-slate-500 mb-2">Add Member</label>
                <div className="flex gap-2">
                  <select 
                    className="form-input text-sm"
                    onChange={(e) => {
                      if (e.target.value) handleAddMember(e.target.value);
                      e.target.value = "";
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select a classmate...</option>
                    {availableStudents.map(student => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary w-full" onClick={() => setShowMembersModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showSprintsModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2 className="font-bold flex items-center gap-2">
                <Layout size={20} className="text-secondary-color" />
                Team Sprints: {selectedTeam?.name}
              </h2>
              <button className="modal-close" onClick={() => {
                setShowSprintsModal(false);
                setSubmissionForm({ sprintId: null, repo: '', web_page: '', pdf_report: '' });
              }}><X size={20} /></button>
            </div>

            <div className="mt-4">
              {loadingSprints ? (
                <div className="text-center py-8">Loading sprints...</div>
              ) : groupSprints.length === 0 ? (
                <div className="text-center py-8 text-muted italic">No sprints have been defined for this group yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sprint List */}
                  <div className="flex flex-col gap-3" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">Available Sprints</h3>
                    {groupSprints.map(sprint => {
                      const submission = teamSubmissions.find(sub => sub.sprint_id === sprint.id);
                      const isSelected = submissionForm.sprintId === sprint.id;
                      
                      return (
                        <div 
                          key={sprint.id} 
                          className={`card p-3 cursor-pointer transition-all border-l-4 ${
                            isSelected ? 'border-primary-color bg-indigo-50' : 
                            submission ? 'border-success' : 'border-slate-300'
                          }`}
                          onClick={() => !submission && setSubmissionForm(prev => ({ ...prev, sprintId: sprint.id }))}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-sm">{sprint.title}</div>
                              <div className="text-xs text-muted">{sprint.module_title}</div>
                            </div>
                            {submission ? (
                              <span className="badge badge-success text-[10px] py-0.5 px-2">Submitted</span>
                            ) : (
                              <span className="badge badge-primary text-[10px] py-0.5 px-2">Pending</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Submission Form */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">
                      {submissionForm.sprintId ? 'Submit Sprint' : 'Select a sprint'}
                    </h3>

                    {submissionForm.sprintId ? (
                      <form onSubmit={handleSubmitSprint}>
                        <div className="form-group mb-3 text-sm">
                          <label className="form-label mb-1">Repository Link</label>
                          <input 
                            type="url" className="form-input py-1.5 px-3" 
                            placeholder="https://github.com/..." 
                            value={submissionForm.repo}
                            onChange={(e) => handleSubmissionChange('repo', e.target.value)}
                          />
                        </div>
                        <div className="form-group mb-3 text-sm">
                          <label className="form-label mb-1">Live Demo Link</label>
                          <input 
                            type="url" className="form-input py-1.5 px-3" 
                            placeholder="https://app-demo.com" 
                            value={submissionForm.web_page}
                            onChange={(e) => handleSubmissionChange('web_page', e.target.value)}
                          />
                        </div>
                        <div className="form-group mb-4 text-sm">
                          <label className="form-label mb-1">PDF Report Link / URL</label>
                          <input 
                            type="text" className="form-input py-1.5 px-3" 
                            placeholder="Google Drive / Dropbox Link" 
                            required
                            value={submissionForm.pdf_report}
                            onChange={(e) => handleSubmissionChange('pdf_report', e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button 
                            type="button" className="btn btn-secondary flex-1 py-1.5"
                            onClick={() => setSubmissionForm({ sprintId: null, repo: '', web_page: '', pdf_report: '' })}
                          >
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-primary flex-1 py-1.5">
                            Submit Work
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-muted py-8 px-4 border-2 border-dashed border-slate-200 rounded-md">
                        <Layout size={32} className="opacity-20 mb-2" />
                        <p className="text-sm">Select a pending sprint from the list to start your submission.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary w-full" onClick={() => setShowSprintsModal(false)}>Close Window</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAgile;
