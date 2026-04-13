import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Upload, Clock } from 'lucide-react';
import { studentService } from '../../services/studentService';

const StudentDashboard = () => {
  const [stats, setStats] = useState({ groupsCount: 0, modulesCount: 0, recentSubmissions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await studentService.getDashboardStats();

        const submissions = data.recentSubmissions || {};
        const flattened = [
          ...(submissions.workshopSubmissions || []).map(s => ({ ...s, title: s.workshop_title, status: 'Workshop', date: s.submitted_at, reaction: s.teacher_reaction || s.reaction || null })),
          ...(submissions.sprintSubmissions || []).map(s => ({ ...s, title: s.sprint_title, status: 'Sprint', date: s.submitted_at, reaction: s.teacher_reaction || s.reaction || null })),
          ...(submissions.pfeSubmissions || []).map(s => ({ ...s, title: s.project_title || 'PFE Final', status: 'PFE', date: s.submitted_at, reaction: s.teacher_reaction || s.reaction || null }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

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
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">Track your classes, modules, and submissions.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon primary">
            <Users size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : stats.groupsCount}</span>
            <span className="stat-label">My Groups</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon success">
            <BookOpen size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : stats.modulesCount}</span>
            <span className="stat-label">My Modules</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon warning">
            <Upload size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : stats.totalSubmissions || 0}</span>
            <span className="stat-label">Total Submissions</span>
          </div>
        </div>
      </div>

      <h3 className="section-heading">Recent Activity</h3>
      <div className="card activity-card">
        {stats.recentSubmissions.length > 0 ? (
          <ul className="activity-list">
            {stats.recentSubmissions.map((sub, idx) => {
              const reaction = sub.reaction;
              return (
              <li
                key={sub.id || idx}
                className="activity-item"
              >
                <div className="activity-item__main">
                  <div className="activity-icon activity-icon--success" aria-hidden>
                    <Upload size={18} />
                  </div>
                  <div className="activity-item__body">
                    <div className="activity-item__top">
                      <p className="activity-text__title">
                        {sub.title || 'Assignment'} — {sub.status}
                      </p>
                      <span className="activity-inline-date">
                        <Clock size={14} aria-hidden />
                        {sub.date ? new Date(sub.date).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                    <p className="activity-text__sub">
                      {reaction
                        ? `Teacher mark: ${reaction}`
                        : 'Successfully submitted'}
                    </p>
                  </div>
                </div>
              </li>
            );
            })}
          </ul>
        ) : (
          <div className="activity-empty">
            No recent activity.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
