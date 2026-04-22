import React, { useState, useEffect } from 'react';
import { Building, Users, FileText } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { internshipService } from '../../services/internshipService';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/locale';
import { formatGroupTitle } from '../../utils/groupFormatters';


const TeacherInternships = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || 'en';
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
    } catch {
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
    } catch {
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
          <h1 className="page-title">{t('teacher.internships.title', { defaultValue: 'Internships' })}</h1>
          <p className="page-subtitle">{t('teacher.internships.subtitle', { defaultValue: 'Track student internships and paperwork.' })}</p>
        </div>
      </div>

      <div className="card card--toolbar">
        <label className="card--toolbar__label" htmlFor="intern-group">{t('teacher.internships.selectGroup', { defaultValue: 'Select Group:' })}</label>
        <div className="card--toolbar__fields">
          <select
            id="intern-group"
            className="form-input form-input--compact-select"
            value={selectedGroup || ''}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            {groups.map(g => (
              <option key={g.id} value={g.id}>{formatGroupTitle(g.name, g.year)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-cards">
        {(loading) ? (
          <div className="loading-state">{t('teacher.internships.loading', { defaultValue: 'Loading internships...' })}</div>
        ) : internships.length === 0 ? (
          <div className="empty-state-card card">
            <Building size={48} className="empty-state-card__icon" />
            <h3 className="empty-state-card__title">{t('teacher.internships.emptyTitle', { defaultValue: 'No Internships Found' })}</h3>
            <p>{t('teacher.internships.emptyText', { defaultValue: 'No students in this group have registered internships yet.' })}</p>
          </div>
        ) : (
          internships.map(intern => (
            <div key={intern.id} className="card card--col">
              <div>
                <div className="card__head">
                  <div className="card__title-group">
                    <div className="media-icon media-icon--primary">
                      <Users size={20} />
                    </div>
                    {intern.student_name}
                  </div>
                </div>

                <div className="card__body">
                  <div className="company-line">
                    <Building size={16} />
                    {intern.company_name}
                  </div>
                  <div className="card__muted card__muted--spaced"><strong>{t('teacher.internships.supervisor', { defaultValue: 'Supervisor:' })}</strong> {intern.supervisor_name}</div>
                  <div className="card__muted"> {formatDate(intern.start_date, language)} — {formatDate(intern.end_date, language)}</div>
                </div>
              </div>

              <div className="card__footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <div className="card__stamp">{t('teacher.internships.registered', { defaultValue: 'Registered Internship' })}</div>
                {intern.report_pdf && (
                  <a href={intern.report_pdf} target="_blank" rel="noopener noreferrer" className="icon-action-btn" title={t('teacher.internships.viewReport', { defaultValue: 'View Report' })}>
                    <FileText size={18} />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherInternships;
