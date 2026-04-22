import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Upload, Clock } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/locale';
import { formatGroupTitle } from '../../utils/groupFormatters';

const TeacherDashboard = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || 'en';
  const [stats, setStats] = useState({ groupsCount: 0, modulesCount: 0, recentSubmissions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await teacherService.getDashboardStats();

        const submissions = data.recentSubmissions || {};
        const groupYearMap = {};
        (data.groups || []).forEach(g => {
          if (g.name && g.year) groupYearMap[g.name] = g.year;
        });

        const flattened = [
          ...(submissions.workshopSubmissions || []).map(s => ({ ...s, student: s.student_name, type: `WS: ${s.workshop_title}`, date: s.submitted_at })),
          ...(submissions.sprintSubmissions || []).map(s => ({ ...s, student: s.team_name, type: `Sprint: ${s.sprint_title}`, date: s.submitted_at })),
          ...(submissions.pfeSubmissions || []).map(s => ({ ...s, student: s.team_name, type: `PFE: ${s.project_title || t('teacher.dashboard.final', { defaultValue: 'Final' })}`, date: s.submitted_at }))
        ].map(sub => {
          const year = sub.group_year || groupYearMap[sub.group_name];
          const groupTitle = formatGroupTitle(sub.group_name, year);
          const group = groupTitle ? `Group: ${groupTitle}` : null;
          const module = sub.module_title ? `Module: ${sub.module_title}` : null;

          return {
            ...sub,
            activityMeta: [group, module].filter(Boolean).join(' | ') || t('teacher.dashboard.submissionReceived', { defaultValue: 'Submission received' })
          };
        }).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        setStats({
          ...data,
          recentSubmissions: flattened,
          totalSubmissions: (submissions.workshopSubmissions?.length || 0) +
                            (submissions.sprintSubmissions?.length || 0) +
                            (submissions.pfeSubmissions?.length || 0)
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('teacher.dashboard.title', { defaultValue: 'Dashboard Overview' })}</h1>
          <p className="page-subtitle">{t('teacher.dashboard.subtitle', { defaultValue: "Welcome back! Here's what's happening with your classes." })}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon primary">
            <Users size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : stats.groupsCount}</span>
            <span className="stat-label">{t('teacher.dashboard.activeGroups', { defaultValue: 'Active Groups' })}</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon success">
            <BookOpen size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : stats.modulesCount}</span>
            <span className="stat-label">{t('teacher.dashboard.managedModules', { defaultValue: 'Managed Modules' })}</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon warning">
            <Upload size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : stats.totalSubmissions || 0}</span>
            <span className="stat-label">{t('teacher.dashboard.recentSubmissions', { defaultValue: 'Recent Submissions' })}</span>
          </div>
        </div>
      </div>

      <h3 className="section-heading">{t('teacher.dashboard.recentActivity', { defaultValue: 'Recent Activity' })}</h3>
      <div className="card activity-card">
        {stats.recentSubmissions.length > 0 ? (
          <ul className="activity-list">
            {stats.recentSubmissions.map((sub, idx) => (
              <li
                key={sub.id || idx}
                className="activity-item"
              >
                <div className="activity-item__main">
                  <div className="activity-icon" aria-hidden>
                    <Upload size={18} />
                  </div>
                  <div className="activity-item__body">
                    <div className="activity-item__top">
                      <p className="activity-text__title">
                        {t('teacher.dashboard.studentSubmitted', { defaultValue: '{{student}} submitted {{type}}', student: sub.student || t('roles.student'), type: sub.type || t('teacher.dashboard.assignment', { defaultValue: 'assignment' }) })}
                      </p>
                      <span className="activity-inline-date">
                        <Clock size={14} aria-hidden />
                        {sub.date ? formatDate(sub.date, language) : t('teacher.dashboard.justNow', { defaultValue: 'Just now' })}
                      </span>
                    </div>
                    <p className="activity-text__sub">{sub.activityMeta}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="activity-empty">
            {t('teacher.dashboard.noRecentSubmissions', { defaultValue: 'No recent submissions.' })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
