import React, { useState, useEffect } from 'react';
import { Upload, Download, CheckCircle, Clock, Link, ExternalLink, FileText } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import '../../styles/tables.css';

const SubmissionsDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { recentSubmissions } = await teacherService.getDashboardStats();
      
      const workshops = (recentSubmissions.workshopSubmissions || []).map(s => ({
        id: `ws-${s.id}`,
        student: s.student_name,
        type: `Workshop: ${s.workshop_title}`,
        module: s.module_title,
        group: s.group_name,
        date: s.submitted_at,
        links: { repo: s.repo, demo: s.web_page, pdf: s.pdf_report }
      }));

      const sprints = (recentSubmissions.sprintSubmissions || []).map(s => ({
        id: `sp-${s.id}`,
        student: s.team_name, // Team name for agile
        type: `Sprint: ${s.sprint_title}`,
        module: s.module_title,
        group: s.group_name,
        date: s.submitted_at,
        links: { repo: s.repo, demo: s.web_page, pdf: s.pdf_report }
      }));

      const pfes = (recentSubmissions.pfeSubmissions || []).map(s => ({
        id: `pfe-${s.id}`,
        student: s.team_name,
        type: `PFE: ${s.project_title || 'Final Project'}`,
        group: s.group_name,
        date: s.submitted_at,
        links: { repo: s.project_repo, demo: s.project_demo, pdf: s.report_pdf }
      }));

      const allSubmissions = [...workshops, ...sprints, ...pfes].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );

      setSubmissions(allSubmissions);
    } catch (e) {
      console.error('Failed to fetch submissions:', e);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Global Submissions</h1>
          <p className="page-subtitle">Review all incoming student work.</p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Student / Team</th>
              <th>Assignment / Module</th>
              <th>Group</th>
              <th>Date Submitted</th>
              <th className="text-right">Action / Links</th>
            </tr>
          </thead>
          <tbody>
            {(loading) ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">Loading submissions...</td></tr>
            ) : submissions.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">No recent submissions.</td></tr>
            ) : (
              submissions.map(sub => (
                <tr key={sub.id}>
                  <td className="font-semibold">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-success" />
                      {sub.student}
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="font-medium">{sub.type}</div>
                      <div className="text-xs text-muted">{sub.module || '-'}</div>
                    </div>
                  </td>
                  <td><span className="badge">{sub.group}</span></td>
                  <td>
                    <span className="flex items-center gap-1 text-muted">
                      <Clock size={14} /> {new Date(sub.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {sub.links.repo && (
                        <a href={sub.links.repo} target="_blank" rel="noopener noreferrer" className="action-btn" title="View Repository">
                          <Link size={16} />
                        </a>
                      )}
                      {sub.links.demo && (
                        <a href={sub.links.demo} target="_blank" rel="noopener noreferrer" className="action-btn" title="View Demo">
                          <ExternalLink size={16} />
                        </a>
                      )}
                      {sub.links.pdf && (
                        <a href={sub.links.pdf} target="_blank" rel="noopener noreferrer" className="action-btn" title="View Document">
                          <FileText size={16} />
                        </a>
                      )}
                      {!sub.links.repo && !sub.links.demo && !sub.links.pdf && (
                        <span className="text-xs text-muted">No links</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmissionsDashboard;
