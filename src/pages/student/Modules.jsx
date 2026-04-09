import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { studentService } from '../../services/studentService';
import '../../styles/tables.css';

const StudentModules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const data = await studentService.getModules();
      setModules(data);
    } catch (e) {
      console.error(e);
      setModules([
        { id: 1, title: 'Web Development', description: 'React and Node.js backend', teacher_name: 'John Doe', group_name: 'Group A' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Modules</h1>
          <p className="page-subtitle">View the modules assigned to your groups.</p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Teacher</th>
              <th>Group</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">Loading...</td></tr>
            ) : modules.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">No modules found.</td></tr>
            ) : (
              modules.map(mod => (
                <tr key={`${mod.id}-${mod.group_id}`}>
                  <td className="font-semibold flex items-center gap-2">
                    <BookOpen size={16} style={{ color: 'var(--primary-color)' }} />
                    {mod.title}
                  </td>
                  <td className="text-muted">{mod.description || '-'}</td>
                  <td>{mod.teacher_name}</td>
                  <td><span className="badge" style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>{mod.group_name}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentModules;
