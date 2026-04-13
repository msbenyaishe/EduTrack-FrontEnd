import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, ExternalLink, Link, FileText, Video } from 'lucide-react';
import { studentService } from '../../services/studentService';
import '../../styles/tables.css';

const resolveModuleName = (submission) =>
  submission?.module_title ||
  submission?.module_name ||
  submission?.moduleName ||
  submission?.module?.title ||
  submission?.module?.name ||
  submission?.sprint?.module_title ||
  submission?.sprint?.module_name ||
  submission?.sprint?.module?.title ||
  submission?.sprint?.module?.name ||
  '';

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
        module: resolveModuleName(s),
        date: s.submitted_at,
        reaction: s.teacher_reaction || s.reaction || null,
        links: { repo: s.repo, demo: s.web_page, pdf: s.pdf_report }
      }));

      const sprints = (recentSubmissions.sprintSubmissions || []).map(s => ({
        id: `sp-${s.id}`,
        title: s.sprint_title,
        type: 'Sprint',
        module: resolveModuleName(s),
        date: s.submitted_at,
        reaction: s.teacher_reaction || s.reaction || null,
        links: { repo: s.repo, demo: s.web_page, pdf: s.pdf_report }
      }));

      const pfes = (recentSubmissions.pfeSubmissions || []).map(s => ({
        id: `pfe-${s.id}`,
        title: s.project_title || 'PFE Final Project',
        type: 'PFE',
        date: s.submitted_at,
        reaction: s.teacher_reaction || s.reaction || null,
        links: {
          repo: s.project_repo,
          demo: s.project_demo,
          pdf: s.report_pdf || s.final_report || s.pdf_report,
          video: s.explanation_video || s.project_video || s.video_url
        }
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

      <div className="grid-cards my-submissions-grid">
        {loading ? (
          <div className="loading-state">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="empty-state-card card">
            <CheckCircle size={48} className="empty-state-card__icon" />
            <h3 className="empty-state-card__title">No Submissions Found</h3>
            <p>You haven&apos;t submitted any assignments yet.</p>
          </div>
        ) : (
          submissions.map(sub => {
            const reaction = sub.reaction;
            return (
            <div key={sub.id} className="card card--col my-submission-card">
              <div>
                <div className="card__head">
                  <div className="card__title-group">
                    <div className="media-icon media-icon--success">
                      <CheckCircle size={20} />
                    </div>

                    {sub.title}
                  </div>
                  <span className="badge badge-primary badge--trailing">{sub.type}</span>
                </div>

                <div className="card__body">
                  <div className="card__emphasis">{sub.module || 'General'}</div>
                  <div className="meta-inline">
                    <Clock size={12} /> Submitted on {new Date(sub.date).toLocaleDateString()}
                  </div>
                  {reaction && (
                    <div className="student-reaction-row">
                      <span className="student-reaction-label">Teacher reacted</span>
                      <span aria-hidden className="student-reaction-emoji">{reaction}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card__footer link-btn-row">
                {sub.links.repo && (
                  <a href={sub.links.repo} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn--link-tight" title="Repository">
                    <Link size={14} className="btn__icon-left" /> Repo
                  </a>
                )}
                {sub.links.demo && (
                  <a href={sub.links.demo} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn--link-tight" title="Live Demo">
                    <ExternalLink size={14} className="btn__icon-left" /> Demo
                  </a>
                )}
                {sub.links.pdf && (
                  <a href={sub.links.pdf} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn--link-tight" title="PDF Report">
                    <FileText size={14} className="btn__icon-left" /> Report
                  </a>
                )}
                {sub.links.video && (
                  <a href={sub.links.video} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn--link-tight btn--video-link" title="Explanation Video">
                    <Video size={14} className="btn__icon-left" /> Video
                  </a>
                )}
                {!sub.links.repo && !sub.links.demo && !sub.links.pdf && !sub.links.video && (
                  <span className="no-links">No links provided</span>
                )}
              </div>
            </div>
          );
          })
        )}
      </div>
    </div>
  );
};

export default StudentSubmissions;
