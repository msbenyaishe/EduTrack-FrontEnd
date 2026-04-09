import React, { useState, useEffect } from 'react';
import { Users, Plus, Layout, CheckCircle } from 'lucide-react';
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

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      // Logic expects us to select a group first, for mockup we pull directly
      const data = await agileService.getTeams(1);
      setTeams(data);
    } catch (e) {
      setTeams([
        { id: 1, name: 'Team Alpha', members: 3 },
        { id: 2, name: 'Code Wizards', members: 4 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await agileService.createTeam({ group_id: 1, name: teamName });
      setShowCreate(false);
      fetchTeams();
    } catch (e) {
      console.error(e);
      alert('Failed to create team in database.');
    }
  };

  const handleJoin = async (id) => {
    try {
      await agileService.joinTeam(id);
      alert('Joined Team Successfully!');
    } catch (e) {
      if (e.response && e.response.status === 409) {
        alert('You are already a member of this team!');
      } else {
        console.error(e);
        alert('Failed to join team in database.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Agile Teams</h1>
          <p className="page-subtitle">Join or create a team to submit sprints.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={18} /> Create Team
        </button>
      </div>

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
              teams.map(team => (
                <tr key={team.id}>
                  <td className="font-semibold flex items-center gap-2">
                    <Users size={16} className="text-primary-color" />
                    {team.name}
                  </td>
                  <td>{Array.isArray(team.members) ? team.members.length : (team.members || 0)} Students</td>
                  <td className="text-right">
                    {team.members?.some(m => m.id === user?.id) ? (
                      <span className="badge badge-success flex items-center gap-1 justify-end w-auto inline-flex">
                        <CheckCircle size={14}/> Joined
                      </span>
                    ) : (
                      <button className="btn btn-secondary w-auto gap-1 text-sm py-1 px-3" onClick={() => handleJoin(team.id)}>
                        Join Team
                      </button>
                    )}
                  </td>
                </tr>
              ))
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
    </div>
  );
};

export default StudentAgile;
