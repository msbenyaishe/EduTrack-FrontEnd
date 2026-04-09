import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, Trash2 } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { pfeService } from '../../services/pfeService';
import '../../styles/tables.css';

const TeacherPFE = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  const [pfeTeams, setPfeTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchPfeTeams(selectedGroup);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const grpData = await teacherService.getGroups();
      setGroups(grpData);
      if(grpData.length > 0) setSelectedGroup(grpData[0].id);
    } catch (e) {
      setGroups([{ id: 1, name: 'L3 INFO Grp A' }]);
      setSelectedGroup(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchPfeTeams = async (groupId) => {
    try {
      const data = await pfeService.getTeams(groupId);
      setPfeTeams(data);
    } catch (e) {
      setPfeTeams([{ id: 1, name: 'PFE EduTrack', members: 2 }]);
    }
  };

  const handleDelete = async (id) => {
    try {
      await pfeService.deleteTeam(id);
      fetchPfeTeams(selectedGroup);
    } catch (e) {
      console.error(e);
      alert('Failed to delete PFE team from database.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">PFE Teams</h1>
          <p className="page-subtitle">End-of-study projects (Projet de Fin d'Études)</p>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <p className="font-semibold text-muted">Select Group:</p>
        <select 
          className="form-input" 
          style={{ width: '300px' }}
          value={selectedGroup || ''} 
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Project Title / Team</th>
              <th>Members</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(loading) ? (
              <tr><td colSpan="3" className="text-center text-muted py-4">Loading teams...</td></tr>
            ) : pfeTeams.length === 0 ? (
              <tr><td colSpan="3" className="text-center text-muted py-4">No PFE teams registered.</td></tr>
            ) : (
              pfeTeams.map(team => (
                <tr key={team.id}>
                  <td className="font-semibold flex items-center gap-2">
                    <GraduationCap size={16} className="text-primary-color" />
                    {team.name}
                  </td>
                  <td>{Array.isArray(team.members) ? team.members.length : (team.members || 0)} Students</td>
                  <td className="text-right flex items-center justify-end gap-2">
                    <button className="action-btn danger" onClick={() => handleDelete(team.id)}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherPFE;
