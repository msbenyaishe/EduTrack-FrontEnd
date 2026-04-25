import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Folder, CheckCircle, Clock, Link, ExternalLink, FileText, Video, Trash2 } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/locale';
import { formatGroupTitle, formatAcademicYear } from '../../utils/groupFormatters';


const REACTION_OPTIONS = ['👍', '👏', '🔥', '✅', '🎉'];

const SubmissionsDashboard = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || 'en';
  const location = useLocation();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedType, setSelectedType] = useState(
    location.state?.filterType === 'Workshops'
      ? 'workshop'
      : location.state?.filterType === 'Agile Sprints'
        ? 'sprint'
        : location.state?.filterType === 'PFE'
          ? 'pfe'
          : 'all'
  );
  useEffect(() => {
    fetchSubmissions();
  }, [t]);

  const fetchSubmissions = async () => {
    try {
      const { recentSubmissions, groups } = await teacherService.getDashboardStats();

      const groupYearMap = {};
      (groups || []).forEach(g => {
        if (g.name && g.year) groupYearMap[g.name] = g.year;
      });

      const workshops = (recentSubmissions.workshopSubmissions || []).map(s => {
        const year = s.group_year || groupYearMap[s.group_name];
        return {
        id: `ws-${s.id}`,
        submissionId: s.id,
        submissionType: 'workshop',
        category: 'workshop',
        student: s.student_name,
        itemTitle: s.workshop_title,
        module: s.module_title,
        group: formatGroupTitle(s.group_name, year),
        groupYear: year ? formatAcademicYear(year) : null,
        date: s.submitted_at,
        reaction: s.teacher_reaction || s.reaction || null,
        links: { repo: s.repo, demo: s.web_page, pdf: s.pdf_report }
      };
      });

      const sprints = (recentSubmissions.sprintSubmissions || []).map(s => {
        const year = s.group_year || groupYearMap[s.group_name];
        return {
        id: `sp-${s.id}`,
        submissionId: s.id,
        submissionType: 'sprint',
        category: 'sprint',
        student: s.team_name,
        itemTitle: s.sprint_title,
        module: s.module_title,
        group: formatGroupTitle(s.group_name, year),
        groupYear: year ? formatAcademicYear(year) : null,
        date: s.submitted_at,
        reaction: s.teacher_reaction || s.reaction || null,
        links: { repo: s.repo, demo: s.web_page, pdf: s.pdf_report }
      };
      });

      const pfes = (recentSubmissions.pfeSubmissions || []).map(s => {
        const year = s.group_year || groupYearMap[s.group_name];
        return {
        id: `pfe-${s.id}`,
        submissionId: s.id,
        submissionType: 'pfe',
        category: 'pfe',
        student: s.team_name,
        itemTitle: s.project_title || t('teacher.submissions.finalProject', { defaultValue: 'Final Project' }),
        group: formatGroupTitle(s.group_name, year),
        groupYear: year ? formatAcademicYear(year) : null,
        date: s.submitted_at,
        reaction: s.teacher_reaction || s.reaction || null,
        links: {
          repo: s.project_repo,
          demo: s.project_demo,
          pdf: s.report_pdf || s.final_report || s.pdf_report,
          video: s.explanation_video || s.project_video || s.video_url
        }
      };
      });

      const allSubmissions = [...workshops, ...sprints, ...pfes].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
      );

      setSubmissions(allSubmissions);
    } catch (e) {
      console.error(t('teacher.submissions.fetchFailedLog', { defaultValue: 'Failed to fetch submissions:' }), e);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const uniqueGroups = ['all', ...new Set(submissions.map(s => s.group).filter(Boolean))];
  const uniqueYears = ['all', ...new Set(submissions.map(s => s.groupYear).filter(Boolean))];

  const filteredSubmissions = submissions.filter(sub => {
    const matchGroup = selectedGroup === 'all' || sub.group === selectedGroup;
    const matchYear = selectedYear === 'all' || sub.groupYear === selectedYear;
    const matchType = selectedType === 'all' || sub.category === selectedType;
    return matchGroup && matchYear && matchType;
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
    } catch {
      setSubmissions((prev) =>
        prev.map((item) => (item.id === submission.id ? { ...item, reaction: previousReaction } : item))
      );
      alert(t('teacher.submissions.reactionSaveFailed', { defaultValue: 'Could not save reaction yet. Backend endpoint is probably not ready.' }));
    }
  };

  const handleDelete = async (submission) => {
    const ok = window.confirm(t('teacher.submissions.deleteConfirm', { defaultValue: 'Delete this submission? This action cannot be undone.' }));
    if (!ok) return;

    try {
      await teacherService.deleteSubmission(submission.submissionType, submission.submissionId);
      setSubmissions((prev) => prev.filter((item) => item.id !== submission.id));
    } catch (e) {
      console.error(t('teacher.submissions.deleteFailedLog', { defaultValue: 'Failed to delete submission:' }), e);
      alert(t('teacher.submissions.deleteFailed', { defaultValue: 'Could not delete submission. Backend delete endpoint may not be ready.' }));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('teacher.submissions.title', { defaultValue: 'Global Submissions' })}</h1>
          <p className="page-subtitle">{t('teacher.submissions.subtitle', { defaultValue: 'Review all incoming student work.' })}</p>
        </div>
      </div>

      <div className="card card--toolbar">
        <span className="card--toolbar__label">{t('teacher.submissions.filterSubmissions', { defaultValue: 'Filter Submissions:' })}</span>
        <div className="card--toolbar__fields">
          <select
            className="form-input form-input--filter"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            aria-label={t('teacher.submissions.filterByGroup', { defaultValue: 'Filter by group' })}
          >
            {uniqueGroups.map(group => (
              <option key={group} value={group}>{group === 'all' ? t('teacher.submissions.allGroups', { defaultValue: 'All Groups' }) : group}</option>
            ))}
          </select>

          <select
            className="form-input form-input--filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            aria-label={t('teacher.submissions.filterByType', { defaultValue: 'Filter by type' })}
          >
            <option value="all">{t('teacher.submissions.allTypes', { defaultValue: 'All Types' })}</option>
            <option value="workshop">{t('teacher.submissions.workshops', { defaultValue: 'Workshops' })}</option>
            <option value="sprint">{t('teacher.submissions.agileSprints', { defaultValue: 'Agile Sprints' })}</option>
            <option value="pfe">{t('teacher.submissions.pfe', { defaultValue: 'PFE' })}</option>
          </select>

          <select
            className="form-input form-input--filter"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            aria-label={t('teacher.submissions.filterByYear', { defaultValue: 'Filter by year' })}
          >
            {uniqueYears.map(year => (
              <option key={year} value={year}>{year === 'all' ? t('teacher.submissions.allYears', { defaultValue: 'All Years' }) : year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-cards teacher-submissions-grid">
        {loading ? (
          <div className="loading-state">{t('teacher.submissions.loading', { defaultValue: 'Loading submissions...' })}</div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="empty-state-card card">
            <Folder size={48} className="empty-state-card__icon" />
            <p>{t('teacher.submissions.emptyFiltered', { defaultValue: 'No submissions match the selected filters.' })}</p>
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
                        <div className="card__muted">{t('teacher.submissions.groupLabel', { defaultValue: 'Group:' })} {sub.group}</div>
                    </div>
                  </div>
                </div>

                <div className="submission-meta-stack">
                    <div className="submission-type-box">
                        <div className="submission-type-box__title">
                          {t(`teacher.submissions.typeLabel.${sub.category}`, {
                            defaultValue: '{{type}}: {{title}}',
                            type: sub.category,
                            title: sub.itemTitle,
                          })}
                        </div>
                        <div className="submission-type-box__sub">{sub.module || t('teacher.submissions.general', { defaultValue: 'General' })}</div>
                    </div>
                    <div className="meta-inline">
                        <Clock size={12} /> {formatDate(sub.date, language)}
                    </div>
                    <div className="meta-inline submission-mark-row">
                      <span className="submission-mark-label">{t('teacher.submissions.mark', { defaultValue: 'Mark:' })}</span>
                      <div className="submission-reaction-list">
                        {REACTION_OPTIONS.map((emoji) => (
                          <button
                            key={`${sub.id}-${emoji}`}
                            type="button"
                            className={`icon-action-btn submission-reaction-btn ${currentReaction === emoji ? 'submission-reaction-btn--active' : ''}`}
                            onClick={() => handleReaction(sub, emoji)}
                            title={t('teacher.submissions.setMark', { defaultValue: 'Set {{emoji}} mark', emoji })}
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
                  <a href={sub.links.repo} target="_blank" rel="noopener noreferrer" className="icon-action-btn" title={t('teacher.submissions.viewRepository', { defaultValue: 'View Repository' })}>
                    <Link size={18} />
                  </a>
                )}
                {sub.links.demo && (
                  <a href={sub.links.demo} target="_blank" rel="noopener noreferrer" className="icon-action-btn" title={t('teacher.submissions.viewDemo', { defaultValue: 'View Demo' })}>
                    <ExternalLink size={18} />
                  </a>
                )}
                {sub.links.pdf && (
                  <a href={sub.links.pdf} target="_blank" rel="noopener noreferrer" className="icon-action-btn" title={t('teacher.submissions.viewDocument', { defaultValue: 'View Document' })}>
                    <FileText size={18} />
                  </a>
                )}
                {sub.links.video && (
                  <a href={sub.links.video} target="_blank" rel="noopener noreferrer" className="icon-action-btn" title={t('teacher.submissions.watchVideo', { defaultValue: 'Watch Video' })}>
                    <Video size={18} />
                  </a>
                )}
                <button
                  type="button"
                  className="icon-action-btn icon-action-btn--danger"
                  onClick={() => handleDelete(sub)}
                  title={t('teacher.submissions.deleteSubmission', { defaultValue: 'Delete submission' })}
                >
                  <Trash2 size={18} />
                </button>
                {!sub.links.repo && !sub.links.demo && !sub.links.pdf && !sub.links.video && (
                  <span className="no-links">{t('teacher.submissions.noLinks', { defaultValue: 'No links provided' })}</span>
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
