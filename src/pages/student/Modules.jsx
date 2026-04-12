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

      <div className="grid-cards">
        {loading ? (
          <div className="loading-state">Loading modules...</div>
        ) : modules.length === 0 ? (
          <div className="empty-state-card card">
            <BookOpen size={48} className="empty-state-card__icon" />
            <h3 className="empty-state-card__title">No Modules Found</h3>
            <p>You haven&apos;t been assigned any modules yet.</p>
          </div>
        ) : (
          modules.map(mod => (
            <div key={`${mod.id}-${mod.group_id}`} className="card card--col">
              <div>
                <div className="card__head">
                  <div className="card__title-group">
                    <div className="media-icon media-icon--primary">
                      <BookOpen size={20} />
                    </div>
                    {mod.title}
                  </div>
                  <span className="badge badge-primary badge--trailing">{mod.group_name}</span>
                </div>

                <div className="card__body">
                  <p className="card__desc">{mod.description || 'No description available for this module.'}</p>
                  <div className="card__teacher-line"><strong>Teacher:</strong> {mod.teacher_name}</div>
                </div>
              </div>

              <div className="card__footer">
                <div className="card__stamp">Registered Module</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentModules;
