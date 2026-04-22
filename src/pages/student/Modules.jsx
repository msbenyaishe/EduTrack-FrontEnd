import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { useTranslation } from 'react-i18next';
import { formatGroupTitle } from '../../utils/groupFormatters';


const StudentModules = () => {
  const { t } = useTranslation();
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
        { id: 1, title: t('student.modules.sampleTitle', { defaultValue: 'Web Development' }), description: t('student.modules.sampleDesc', { defaultValue: 'React and Node.js backend' }), teacher_name: 'John Doe', group_name: 'Group A' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('student.modules.title', { defaultValue: 'My Modules' })}</h1>
          <p className="page-subtitle">{t('student.modules.subtitle', { defaultValue: 'View the modules assigned to your groups.' })}</p>
        </div>
      </div>

      <div className="grid-cards">
        {loading ? (
          <div className="loading-state">{t('student.modules.loading', { defaultValue: 'Loading modules...' })}</div>
        ) : modules.length === 0 ? (
          <div className="empty-state-card card">
            <BookOpen size={48} className="empty-state-card__icon" />
            <h3 className="empty-state-card__title">{t('student.modules.emptyTitle', { defaultValue: 'No Modules Found' })}</h3>
            <p>{t('student.modules.emptyText', { defaultValue: "You haven't been assigned any modules yet." })}</p>
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
                  <span className="badge badge-primary badge--trailing">{formatGroupTitle(mod.group_name, mod.group_year)}</span>
                </div>

                <div className="card__body">
                  <p className="card__desc">{mod.description || t('student.modules.noDescription', { defaultValue: 'No description available for this module.' })}</p>
                  <div className="card__teacher-line"><strong>{t('student.modules.teacherLabel', { defaultValue: 'Teacher:' })}</strong> {mod.teacher_name}</div>
                </div>
              </div>

              <div className="card__footer">
                <div className="card__stamp">{t('student.modules.registered', { defaultValue: 'Registered Module' })}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentModules;
