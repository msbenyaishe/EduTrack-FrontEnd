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
        
        // Flatten recent submissions for counting and list display
        const submissions = data.recentSubmissions || {};
        const flattened = [
          ...(submissions.workshopSubmissions || []).map(s => ({ ...s, student: s.student_name, type: `WS: ${s.workshop_title}`, date: s.submitted_at })),
          ...(submissions.sprintSubmissions || []).map(s => ({ ...s, student: s.team_name, type: `Sprint: ${s.sprint_title}`, date: s.submitted_at })),
          ...(submissions.pfeSubmissions || []).map(s => ({ ...s, student: s.team_name, type: `PFE: ${s.project_title || 'Final'}`, date: s.submitted_at }))
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
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening with your classes.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon primary">
            <Users size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : stats.groupsCount}</span>
            <span className="stat-label">Active Groups</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon success">
            <BookOpen size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : stats.modulesCount}</span>
            <span className="stat-label">Managed Modules</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon warning">
            <Upload size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : stats.totalSubmissions || 0}</span>
            <span className="stat-label">Recent Submissions</span>
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem', color: 'var(--secondary-color)' }}>Recent Activity</h3>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {stats.recentSubmissions.length > 0 ? (
          <ul style={{ listStyle: 'none' }}>
            {stats.recentSubmissions.map((sub, idx) => (
              <li 
                key={sub.id || idx} 
                className="flex items-center justify-between" 
                style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}
              >
                <div className="flex items-center gap-4">
                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: '50%', color: 'var(--primary-color)' }}>
                    <Upload size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">{sub.student || 'Student'} submitted {sub.type || 'assignment'}</p>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>Group / Module</p>
                  </div>
                </div>
                <div className="flex items-center text-muted gap-1 text-sm">
                  <Clock size={16} />
                  <span>{sub.date ? new Date(sub.date).toLocaleDateString() : 'Just now'}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No recent submissions.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
