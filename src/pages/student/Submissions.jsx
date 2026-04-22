import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, ExternalLink, Link, FileText, Video, Trash2 } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/locale';


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
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || 'en';
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { recentSubmissions } = await studentService.getDashboardStats();

      const workshops = (recentSubmissions.workshopSubmissions || []).map(s => ({
        id: `ws-${s.id}`,
        rawId: s.id,
        apiType: 'workshop',
        title: s.workshop_title,
        type: t('student.submissions.workshop', { defaultValue: 'Workshop' }),
        module: resolveModuleName(s),
        date: s.submitted_at,
        reaction: s.teacher_reaction || s.reaction || null,
        links: { repo: s.repo, demo: s.web_page, pdf: s.pdf_report }
      }));

      const sprints = (recentSubmissions.sprintSubmissions || []).map(s => ({
        id: `sp-${s.id}`,
        rawId: s.id,
        apiType: 'sprint',
        title: s.sprint_title,
        type: t('student.submissions.sprint', { defaultValue: 'Sprint' }),
        module: resolveModuleName(s),
        date: s.submitted_at,
        reaction: s.teacher_reaction || s.reaction || null,
        links: { repo: s.repo, demo: s.web_page, pdf: s.pdf_report }
      }));

      const pfes = (recentSubmissions.pfeSubmissions || []).map(s => ({
        id: `pfe-${s.id}`,
        rawId: s.id,
        apiType: 'pfe',
        title: s.project_title || t('student.submissions.pfeFinalProject', { defaultValue: 'PFE Final Project' }),
        type: t('student.submissions.pfe', { defaultValue: 'PFE' }),
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
      console.error(t('student.submissions.fetchErrorLog', { defaultValue: 'Failed to fetch student submissions:' }), e);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, apiType, rawId) => {
    if (!window.confirm(t('student.submissions.deleteConfirm', { defaultValue: 'Are you sure you want to delete this submission?' }))) return;
    try {
      setDeletingId(id);
      await studentService.deleteSubmission(apiType, rawId);
      setSubmissions(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      alert(e.response?.data?.message || t('student.submissions.deleteFailed', { defaultValue: 'Failed to delete submission' }));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('student.submissions.title', { defaultValue: 'My Submissions' })}</h1>
          <p className="page-subtitle">{t('student.submissions.subtitle', { defaultValue: 'History of all your assignments, sprints, and tasks.' })}</p>
        </div>
      </div>

      <div className="grid-cards my-submissions-grid">
        {loading ? (
          <div className="loading-state">{t('student.submissions.loading', { defaultValue: 'Loading submissions...' })}</div>
        ) : submissions.length === 0 ? (
          <div className="empty-state-card card">
            <CheckCircle size={48} className="empty-state-card__icon" />
            <h3 className="empty-state-card__title">{t('student.submissions.emptyTitle', { defaultValue: 'No Submissions Found' })}</h3>
            <p>{t('student.submissions.emptyText', { defaultValue: "You haven't submitted any assignments yet." })}</p>
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
                  <div className="card__emphasis">{sub.module || t('student.submissions.general', { defaultValue: 'General' })}</div>
                  <div className="meta-inline">
                    <Clock size={12} /> {t('student.submissions.submittedOn', { defaultValue: 'Submitted on' })} {formatDate(sub.date, language)}
                  </div>
                  {!!reaction && (
                    <div className="student-reaction-row">
                      <span className="student-reaction-label">{t('student.submissions.teacherReacted', { defaultValue: 'Teacher reacted' })}</span>
                      <span aria-hidden className="student-reaction-emoji">{reaction}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card__footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 'var(--space-sm)' }}>
                
                {/* Top row: Repo & Demo */}
                {(sub.links.repo || sub.links.demo) && (
                  <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    {sub.links.repo && (
                      <a href={sub.links.repo} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn--link-tight" style={{ flex: 1 }} title={t('student.submissions.repository', { defaultValue: 'Repository' })}>
                        <Link size={14} className="btn__icon-left" /> {t('student.submissions.repo', { defaultValue: 'Repo' })}
                      </a>
                    )}
                    {sub.links.demo && (
                      <a href={sub.links.demo} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn--link-tight" style={{ flex: 1 }} title={t('student.submissions.liveDemo', { defaultValue: 'Live Demo' })}>
                        <ExternalLink size={14} className="btn__icon-left" /> {t('student.submissions.demo', { defaultValue: 'Demo' })}
                      </a>
                    )}
                  </div>
                )}

                {/* Bottom row: Report, Video & Trash Container */}
                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                  {!sub.links.repo && !sub.links.demo && !sub.links.pdf && !sub.links.video && (
                    <span className="no-links" style={{ flex: 1 }}>{t('student.submissions.noLinks', { defaultValue: 'No links provided' })}</span>
                  )}
                  {sub.links.pdf && (
                    <a href={sub.links.pdf} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn--link-tight" style={{ flex: 1 }} title={t('student.submissions.pdfReport', { defaultValue: 'PDF Report' })}>
                      <FileText size={14} className="btn__icon-left" /> {t('student.submissions.report', { defaultValue: 'Report' })}
                    </a>
                  )}
                  {sub.links.video && (
                    <a href={sub.links.video} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn--link-tight btn--video-link" style={{ flex: 1 }} title={t('student.submissions.explanationVideo', { defaultValue: 'Explanation Video' })}>
                      <Video size={14} className="btn__icon-left" /> {t('student.submissions.video', { defaultValue: 'Video' })}
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn-icon-danger"
                    style={{ flexShrink: 0 }}
                    onClick={() => handleDelete(sub.id, sub.apiType, sub.rawId)}
                    disabled={deletingId === sub.id}
                    title={t('student.submissions.deleteSubmission', { defaultValue: 'Delete Submission' })}
                  >
                    <Trash2 size={23} />
                  </button>
                </div>
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
