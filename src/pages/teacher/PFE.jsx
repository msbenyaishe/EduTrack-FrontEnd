import React, { useState, useEffect } from 'react';
import { GraduationCap, Trash2 } from 'lucide-react';
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
    } catch {
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
    } catch {
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
          <p className="page-subtitle">End-of-study projects (Projet de Fin d&apos;Études)</p>
        </div>
      </div>

      <div className="card card--toolbar">
        <label className="card--toolbar__label" htmlFor="pfe-group">Select Group:</label>
        <div className="card--toolbar__fields">
          <select
            id="pfe-group"
            className="form-input form-input--compact-select"
            value={selectedGroup || ''}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-cards">
        {(loading) ? (
          <div className="loading-state">Loading PFE teams...</div>
        ) : pfeTeams.length === 0 ? (
          <div className="empty-state-card card">
            <GraduationCap size={48} className="empty-state-card__icon" />
            <h3 className="empty-state-card__title">No PFE Teams Found</h3>
            <p>No students in this group have created PFE teams yet.</p>
          </div>
        ) : (
          pfeTeams.map(team => (
            <div key={team.id} className="card card--col">
              <div>
                <div className="card__head">
                  <div className="card__title-group">
                    <div className="media-icon media-icon--primary">
                      <GraduationCap size={20} />
                    </div>
                    {team.name}
                  </div>
                </div>

                <div className="card__body">
                  <div className="badge badge-primary badge--block">
                    {Array.isArray(team.members) ? team.members.length : (team.members || 0)} Students
                  </div>
                  <div className="card__muted">Final graduation project team</div>
                </div>
              </div>

              <div className="card__footer">
                <div className="card__stamp">Registered PFE Team</div>
                <button type="button" className="icon-action-btn icon-action-btn--danger" onClick={() => handleDelete(team.id)} title="Delete Team">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherPFE;
