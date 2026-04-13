import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Upload, Clock } from 'lucide-react';
import { teacherService } from '../../services/teacherService';

const TeacherDashboard = () => {
  const [stats, setStats] = useState({ groupsCount: 0, modulesCount: 0, recentSubmissions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await teacherService.getDashboardStats();

        const submissions = data.recentSubmissions || {};
        const flattened = [
          ...(submissions.workshopSubmissions || []).map(s => ({ ...s, student: s.student_name, type: `WS: ${s.workshop_title}`, date: s.submitted_at })),
          ...(submissions.sprintSubmissions || []).map(s => ({ ...s, student: s.team_name, type: `Sprint: ${s.sprint_title}`, date: s.submitted_at })),
          ...(submissions.pfeSubmissions || []).map(s => ({ ...s, student: s.team_name, type: `PFE: ${s.project_title || 'Final'}`, date: s.submitted_at }))
        ].map(sub => {
          const group = sub.group_name ? `Group: ${sub.group_name}` : null;
          const module = sub.module_title ? `Module: ${sub.module_title}` : null;

          return {
            ...sub,
            activityMeta: [group, module].filter(Boolean).join(' | ') || 'Submission received'
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
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome back! Here&apos;s what&apos;s happening with your classes.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon primary">
            <Users size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : stats.groupsCount}</span>
            <span className="stat-label">Active Groups</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon success">
            <BookOpen size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : stats.modulesCount}</span>
            <span className="stat-label">Managed Modules</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon warning">
            <Upload size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : stats.totalSubmissions || 0}</span>
            <span className="stat-label">Recent Submissions</span>
          </div>
        </div>
      </div>

      <h3 className="section-heading">Recent Activity</h3>
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
                        {sub.student || 'Student'} submitted {sub.type || 'assignment'}
                      </p>
                      <span className="activity-inline-date">
                        <Clock size={14} aria-hidden />
                        {sub.date ? new Date(sub.date).toLocaleDateString() : 'Just now'}
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
            No recent submissions.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
