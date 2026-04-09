import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, Clock, ExternalLink, Link, FileText } from 'lucide-react';
import { studentService } from '../../services/studentService';
import '../../styles/tables.css';

const StudentSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { recentSubmissions } = await studentService.getDashboardStats();
      
      const workshops = (recentSubmissions.workshopSubmissions || []).map(s => ({
        id: `ws-${s.id}`,
        title: s.workshop_title,
        type: 'Workshop',
        module: s.module_title,
        date: s.submitted_at,
        links: { repo: s.repo, demo: s.web_page, pdf: s.pdf_report }
      }));

      const sprints = (recentSubmissions.sprintSubmissions || []).map(s => ({
        id: `sp-${s.id}`,
        title: s.sprint_title,
        type: 'Sprint',
        module: s.module_title,
        date: s.submitted_at,
        links: { repo: s.repo, demo: s.web_page, pdf: s.pdf_report }
      }));

      const pfes = (recentSubmissions.pfeSubmissions || []).map(s => ({
        id: `pfe-${s.id}`,
        title: s.project_title || 'PFE Final Project',
        type: 'PFE',
        date: s.submitted_at,
        links: { repo: s.project_repo, demo: s.project_demo, pdf: s.report_pdf }
      }));

      const all = [...workshops, ...sprints, ...pfes].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );

      setSubmissions(all);
    } catch (e) {
      console.error('Failed to fetch student submissions:', e);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Submissions</h1>
          <p className="page-subtitle">History of all your assignments, sprints, and tasks.</p>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Assignment / Module</th>
              <th>Type</th>
              <th>Date Submitted</th>
              <th className="text-right">My Links</th>
            </tr>
          </thead>
          <tbody>
            {(loading) ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">Loading submissions...</td></tr>
            ) : submissions.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted py-4">No submissions yet!</td></tr>
            ) : (
              submissions.map(sub => (
                <tr key={sub.id}>
                  <td className="font-semibold">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-success" />
                      <div>
                        <div>{sub.title}</div>
                        <div className="text-xs text-muted">{sub.module || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge">{sub.type}</span></td>
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

export default StudentSubmissions;
