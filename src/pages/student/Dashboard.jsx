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
        
        // Flatten recent submissions for counting and list display
        const submissions = data.recentSubmissions || {};
        const flattened = [
          ...(submissions.workshopSubmissions || []).map(s => ({ ...s, title: s.workshop_title, status: 'Workshop', date: s.submitted_at })),
          ...(submissions.sprintSubmissions || []).map(s => ({ ...s, title: s.sprint_title, status: 'Sprint', date: s.submitted_at })),
          ...(submissions.pfeSubmissions || []).map(s => ({ ...s, title: s.project_title || 'PFE Final', status: 'PFE', date: s.submitted_at }))
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
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-subtitle">Track your classes, modules, and submissions.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon primary">
            <Users size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : stats.groupsCount}</span>
            <span className="stat-label">My Groups</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon success">
            <BookOpen size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : stats.modulesCount}</span>
            <span className="stat-label">My Modules</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon warning">
            <Upload size={28} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '-' : stats.totalSubmissions || 0}</span>
            <span className="stat-label">Total Submissions</span>
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
                  <div style={{ backgroundColor: '#D1FAE5', padding: '0.75rem', borderRadius: '50%', color: '#059669' }}>
                    <Upload size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">{sub.title || 'Assignment'} - {sub.status}</p>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>Successfully submitted</p>
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
            No recent activity.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
