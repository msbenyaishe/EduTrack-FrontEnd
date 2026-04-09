import React, { useState, useEffect } from 'react';
import { FileBox, Building, Users } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { internshipService } from '../../services/internshipService';
import '../../styles/tables.css';

const TeacherInternships = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedGroup) fetchInternships(selectedGroup);
  }, [selectedGroup]);

  const fetchInitialData = async () => {
    try {
      const data = await teacherService.getGroups();
      setGroups(data);
      if (data.length > 0) setSelectedGroup(data[0].id);
    } catch (e) {
      setGroups([{ id: 1, name: 'Master 2 IT' }]);
      setSelectedGroup(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchInternships = async (groupId) => {
    try {
      const data = await internshipService.getGroupInternships(groupId);
      setInternships(data);
    } catch (e) {
      setInternships([{ 
        id: 1, student_name: 'John Doe', company_name: 'Google', 
        supervisor_name: 'Jane Smith', start_date: '2025-02-01', end_date: '2025-06-01' 
      }]);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Internships</h1>
          <p className="page-subtitle">Track student internships and paperwork.</p>
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
              <th>Student</th>
              <th>Company</th>
              <th>Supervisor</th>
              <th>Period</th>
            </tr>
          </thead>
          <tbody>
            {(loading) ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">Loading...</td></tr>
            ) : internships.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">No internships found for this group.</td></tr>
            ) : (
              internships.map(intern => (
                <tr key={intern.id}>
                  <td className="font-semibold flex items-center gap-2">
                    <Users size={16} className="text-primary-color" />
                    {intern.student_name}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Building size={14} className="text-muted" />
                      {intern.company_name}
                    </div>
                  </td>
                  <td>{intern.supervisor_name}</td>
                  <td>{new Date(intern.start_date).toLocaleDateString()} to {new Date(intern.end_date).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherInternships;
