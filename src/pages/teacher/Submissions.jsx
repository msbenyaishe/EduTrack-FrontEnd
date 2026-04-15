import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Folder, CheckCircle, Clock, Link, ExternalLink, FileText, Video, Trash2 } from 'lucide-react';
import { teacherService } from '../../services/teacherService';


const REACTION_OPTIONS = ['👍', '👏', '🔥', '✅', '🎉'];

const SubmissionsDashboard = () => {
  const location = useLocation();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedType, setSelectedType] = useState(location.state?.filterType || 'All');
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { recentSubmissions } = await teacherService.getDashboardStats();

      const workshops = (recentSubmissions.workshopSubmissions || []).map(s => ({
        id: `ws-${s.id}`,
        submissionId: s.id,
        submissionType: 'workshop',
        student: s.student_name,
        type: `Workshop: ${s.workshop_title}`,
        module: s.module_title,
        group: s.group_name,
        date: s.submitted_at,
        reaction: s.teacher_reaction || s.reaction || null,
        links: { repo: s.repo, demo: s.web_page, pdf: s.pdf_report }
      }));

      const sprints = (recentSubmissions.sprintSubmissions || []).map(s => ({
        id: `sp-${s.id}`,
        submissionId: s.id,
        submissionType: 'sprint',
        student: s.team_name,
        type: `Sprint: ${s.sprint_title}`,
        module: s.module_title,
        group: s.group_name,
        date: s.submitted_at,
        reaction: s.teacher_reaction || s.reaction || null,
        links: { repo: s.repo, demo: s.web_page, pdf: s.pdf_report }
      }));

      const pfes = (recentSubmissions.pfeSubmissions || []).map(s => ({
        id: `pfe-${s.id}`,
        submissionId: s.id,
        submissionType: 'pfe',
        student: s.team_name,
        type: `PFE: ${s.project_title || 'Final Project'}`,
        group: s.group_name,
        date: s.submitted_at,
        reaction: s.teacher_reaction || s.reaction || null,
        links: {
          repo: s.project_repo,
          demo: s.project_demo,
          pdf: s.report_pdf || s.final_report || s.pdf_report,
          video: s.explanation_video || s.project_video || s.video_url
        }
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

  const uniqueGroups = ['All', ...new Set(submissions.map(s => s.group).filter(Boolean))];

  const filteredSubmissions = submissions.filter(sub => {
    const matchGroup = selectedGroup === 'All' || sub.group === selectedGroup;
    let matchType = true;
    if (selectedType === 'Workshops') matchType = sub.type.startsWith('Workshop');
    if (selectedType === 'Agile Sprints') matchType = sub.type.startsWith('Sprint');
    if (selectedType === 'PFE') matchType = sub.type.startsWith('PFE');
    return matchGroup && matchType;
  });

  const handleReaction = async (submission, reaction) => {
    const previousReaction = submission.reaction || null;
    setSubmissions((prev) =>
      prev.map((item) => (item.id === submission.id ? { ...item, reaction } : item))
    );
    try {
      await teacherService.updateSubmissionReaction(
        submission.submissionType,
        submission.submissionId,
        reaction
      );
    } catch (e) {
      setSubmissions((prev) =>
        prev.map((item) => (item.id === submission.id ? { ...item, reaction: previousReaction } : item))
      );
      alert('Could not save reaction yet. Backend endpoint is probably not ready.');
    }
  };

  const handleDelete = async (submission) => {
    const ok = window.confirm('Delete this submission? This action cannot be undone.');
    if (!ok) return;

    try {
      await teacherService.deleteSubmission(submission.submissionType, submission.submissionId);
      setSubmissions((prev) => prev.filter((item) => item.id !== submission.id));
    } catch (e) {
      console.error('Failed to delete submission:', e);
      alert('Could not delete submission. Backend delete endpoint may not be ready.');
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

      <div className="card card--toolbar">
        <span className="card--toolbar__label">Filter Submissions:</span>
        <div className="card--toolbar__fields">
          <select
            className="form-input form-input--filter"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            aria-label="Filter by group"
          >
            {uniqueGroups.map(group => (
              <option key={group} value={group}>{group === 'All' ? 'All Groups' : group}</option>
            ))}
          </select>

          <select
            className="form-input form-input--filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            aria-label="Filter by type"
          >
            <option value="All">All Types</option>
            <option value="Workshops">Workshops</option>
            <option value="Agile Sprints">Agile Sprints</option>
            <option value="PFE">PFE</option>
          </select>
        </div>
      </div>

      <div className="grid-cards teacher-submissions-grid">
        {loading ? (
          <div className="loading-state">Loading submissions...</div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="empty-state-card card">
            <Folder size={48} className="empty-state-card__icon" />
            <p>No submissions match the selected filters.</p>
          </div>
        ) : (
          filteredSubmissions.map(sub => {
            const currentReaction = sub.reaction;
            return (
            <div key={sub.id} className="card card--col teacher-submission-card">
              <div>
                <div className="card__head">
                  <div className="submission-card__profile">
                    <div className="media-icon media-icon--success">
                      <CheckCircle size={18} />
                    </div>
                    <div>
                        <div className="submission-card__name">{sub.student}</div>
                        <div className="card__muted">Group: {sub.group}</div>
                    </div>
                  </div>
                </div>

                <div className="submission-meta-stack">
                    <div className="submission-type-box">
                        <div className="submission-type-box__title">{sub.type}</div>
                        <div className="submission-type-box__sub">{sub.module || 'General'}</div>
                    </div>
                    <div className="meta-inline">
                        <Clock size={12} /> {new Date(sub.date).toLocaleDateString()}
                    </div>
                    <div className="meta-inline submission-mark-row">
                      <span className="submission-mark-label">Mark:</span>
                      <div className="submission-reaction-list">
                        {REACTION_OPTIONS.map((emoji) => (
                          <button
                            key={`${sub.id}-${emoji}`}
                            type="button"
                            className={`icon-action-btn submission-reaction-btn ${currentReaction === emoji ? 'submission-reaction-btn--active' : ''}`}
                            onClick={() => handleReaction(sub, emoji)}
                            title={`Set ${emoji} mark`}
                          >
                            <span aria-hidden className="submission-reaction-emoji">{emoji}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                </div>
              </div>

              <div className="card__footer">
                {sub.links.repo && (
                  <a href={sub.links.repo} target="_blank" rel="noopener noreferrer" className="icon-action-btn" title="View Repository">
                    <Link size={18} />
                  </a>
                )}
                {sub.links.demo && (
                  <a href={sub.links.demo} target="_blank" rel="noopener noreferrer" className="icon-action-btn" title="View Demo">
                    <ExternalLink size={18} />
                  </a>
                )}
                {sub.links.pdf && (
                  <a href={sub.links.pdf} target="_blank" rel="noopener noreferrer" className="icon-action-btn" title="View Document">
                    <FileText size={18} />
                  </a>
                )}
                {sub.links.video && (
                  <a href={sub.links.video} target="_blank" rel="noopener noreferrer" className="icon-action-btn" title="Watch Video">
                    <Video size={18} />
                  </a>
                )}
                <button
                  type="button"
                  className="icon-action-btn icon-action-btn--danger"
                  onClick={() => handleDelete(sub)}
                  title="Delete submission"
                >
                  <Trash2 size={18} />
                </button>
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

export default SubmissionsDashboard;
