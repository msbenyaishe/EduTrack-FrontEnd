import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Mail, Clock, Trash2, Plus, BookOpen, Share2, Calendar, X, Link as LinkIcon, GraduationCap, Loader, Save } from 'lucide-react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { teacherService } from '../../services/teacherService';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/locale';
import { formatAcademicYear, formatGroupTitle } from '../../utils/groupFormatters';
import BadgeTemplate from '../../components/BadgeTemplate';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
const BADGE_WIDTH = 400;
const BADGE_HEIGHT = 600;
const BADGE_SCALE = 0.52;
const BADGE_GAP = 24;
const PAGE_GAP = 30;

const SCALED_BADGE_WIDTH = Math.round(BADGE_WIDTH * BADGE_SCALE);
const SCALED_BADGE_HEIGHT = Math.round(BADGE_HEIGHT * BADGE_SCALE);

function normalizeMediaUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (!API_BASE) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

function parseAdditionalData(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function pickStudentPhoto(student) {
  if (!student || typeof student !== 'object') return null;
  const raw =
    student.personal_image ||
    student.personal_image_url ||
    student.profile_picture ||
    student.profile_picture_url ||
    student.avatar ||
    student.avatarUrl ||
    student.photo ||
    student.photoUrl ||
    student.user?.personal_image ||
    student.user?.personal_image_url ||
    student.user?.avatar ||
    student.user?.avatarUrl ||
    student.profile?.personal_image ||
    student.profile?.personal_image_url ||
    null;
  return normalizeMediaUrl(raw);
}

function pickPortfolioLink(student) {
  if (!student || typeof student !== 'object') return null;
  const additional =
    parseAdditionalData(student.additional_profile_data) ||
    parseAdditionalData(student.user?.additional_profile_data) ||
    parseAdditionalData(student.profile?.additional_profile_data);

  return (
    student.portfolio_link ||
    student.portfolioLink ||
    student.portfolio ||
    student.user?.portfolio_link ||
    student.user?.portfolioLink ||
    student.profile?.portfolio_link ||
    student.profile?.portfolioLink ||
    additional?.portfolio_link ||
    additional?.portfolioLink ||
    null
  );
}

function preloadImage(source) {
  if (!source) return Promise.resolve();
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = source;
  });
}


const GroupDetails = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || 'en';
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [modules, setModules] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [inviteExpiry, setInviteExpiry] = useState('');
  const [updatingExpiry, setUpdatingExpiry] = useState(false);
  const [showGroupBadgeModal, setShowGroupBadgeModal] = useState(false);
  const [isGeneratingGroupBadge, setIsGeneratingGroupBadge] = useState(false);
  const [groupBadgePreview, setGroupBadgePreview] = useState(null);
  const [badgesPerRow, setBadgesPerRow] = useState(3);
  const [badgesPerColumn, setBadgesPerColumn] = useState(2);
  const [badgeStudents, setBadgeStudents] = useState([]);
  const [badgeQrCodes, setBadgeQrCodes] = useState({});
  const badgeSheetRef = useRef(null);

  const waitForBadgeRender = () =>
    new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });

  const badgesPerPage = Math.max(1, badgesPerRow * badgesPerColumn);
  const badgePages = useMemo(() => {
    if (!badgeStudents.length) return [];
    const pages = [];
    for (let i = 0; i < badgeStudents.length; i += badgesPerPage) {
      pages.push(badgeStudents.slice(i, i + badgesPerPage));
    }
    return pages;
  }, [badgeStudents, badgesPerPage]);

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const fetchGroupData = async () => {
    try {
      const [groupData, studentsData, groupModules, allTeacherModules] = await Promise.all([
        teacherService.getGroupDetails(id),
        teacherService.getGroupStudents(id),
        teacherService.getGroupModules(id),
        teacherService.getModules()
      ]);
      setGroup(groupData);
      const studentsRows = Array.isArray(studentsData)
        ? studentsData
        : studentsData?.students || studentsData?.data || [];
      setStudents(studentsRows);
      setModules(groupModules);
      setAllModules(allTeacherModules);

      if (groupData.invite_expires_at) {
        const date = new Date(groupData.invite_expires_at);
        const isoString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
        setInviteExpiry(isoString.slice(0, 16));
      }
    } catch (e) {
      console.error(e);
      setGroup({ id, name: t('teacher.groupDetails.groupNotFound', { defaultValue: 'Group Not Found' }), year: '-', invite_code: 'ERROR' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (window.confirm(t('teacher.groupDetails.removeStudentConfirm', { defaultValue: 'Are you sure you want to remove this student from the group?' }))) {
      try {
        await teacherService.removeStudentFromGroup(id, studentId);
        setStudents(students.filter(s => s.id !== studentId));
      } catch (e) {
        console.error(e);
        alert(t('teacher.groupDetails.removeStudentFailed', { defaultValue: 'Failed to remove student.' }));
      }
    }
  };

  const handleAssignModule = async (moduleId) => {
    try {
      await teacherService.assignModuleToGroup({ module_id: moduleId, group_id: id });
      const mod = allModules.find(m => m.id === parseInt(moduleId));
      setModules([...modules, mod]);
      setShowModuleModal(false);
    } catch (e) {
      console.error(e);
      alert(t('teacher.groupDetails.assignModuleFailed', { defaultValue: 'Failed to assign module. It might already be assigned.' }));
    }
  };

  const handleUnassignModule = async (moduleId) => {
    if (window.confirm(t('teacher.groupDetails.removeModuleConfirm', { defaultValue: 'Are you sure you want to remove this module from the group?' }))) {
      try {
        await teacherService.unassignModuleFromGroup(moduleId, id);
        setModules(modules.filter(m => m.id !== moduleId));
      } catch (e) {
        console.error(e);
        alert(t('teacher.groupDetails.removeModuleFailed', { defaultValue: 'Failed to remove module.' }));
      }
    }
  };

  const handleGenerateNewCode = async () => {
    if (window.confirm(t('teacher.groupDetails.regenerateConfirm', { defaultValue: 'Generating a new code will immediately invalidate the old one. Continue?' }))) {
      try {
        const data = await teacherService.generateInviteCode(id);
        setGroup({ ...group, invite_code: data.invite_code });
      } catch (e) {
        console.error(e);
        alert(t('teacher.groupDetails.regenerateFailed', { defaultValue: 'Failed to generate new code.' }));
      }
    }
  };

  const handleUpdateExpiration = async () => {
    setUpdatingExpiry(true);
    try {
      await teacherService.updateGroup(id, { invite_expires_at: inviteExpiry });
      setGroup({ ...group, invite_expires_at: inviteExpiry });
      alert(t('teacher.groupDetails.expirationUpdated', { defaultValue: 'Expiration date updated successfully!' }));
    } catch (e) {
      console.error(e);
      alert(t('teacher.groupDetails.expirationUpdateFailed', { defaultValue: 'Failed to update expiration date.' }));
    } finally {
      setUpdatingExpiry(false);
    }
  };

  const closeGroupBadgeModal = () => {
    if (isGeneratingGroupBadge) return;
    setShowGroupBadgeModal(false);
    setGroupBadgePreview(null);
  };

  const generateGroupBadgesImage = async () => {
    if (!students.length) {
      alert(t('teacher.groupDetails.noStudentsForBadges', { defaultValue: 'No students available to generate badges.' }));
      return;
    }

    setIsGeneratingGroupBadge(true);
    setGroupBadgePreview(null);

    try {
      const normalizedStudents = students.map((student) => ({
        ...student,
        personal_image: pickStudentPhoto(student) || null,
        portfolio_link: pickPortfolioLink(student) || '',
      }));

      await Promise.all(normalizedStudents.map((student) => preloadImage(student.personal_image)));

      const qrPairs = await Promise.all(
        normalizedStudents.map(async (student) => {
          if (!student.portfolio_link) return [student.id, ''];
          const qrData = await QRCode.toDataURL(student.portfolio_link, {
            width: 200,
            margin: 0,
            color: { dark: '#0f172a', light: '#ffffff' },
          });
          return [student.id, qrData];
        })
      );

      setBadgeStudents(normalizedStudents);
      setBadgeQrCodes(Object.fromEntries(qrPairs));
      await waitForBadgeRender();

      if (!badgeSheetRef.current) {
        throw new Error('Group badge sheet container is not ready.');
      }

      const canvas = await html2canvas(badgeSheetRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#e2e8f0',
      });

      setGroupBadgePreview(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error('Group badges generation error:', error);
      alert(t('teacher.groupDetails.groupBadgesGenerateFailed', { defaultValue: 'Failed to generate group badges image.' }));
    } finally {
      setIsGeneratingGroupBadge(false);
    }
  };

  const downloadGroupBadges = () => {
    if (!groupBadgePreview || !group?.name) return;
    const link = document.createElement('a');
    link.href = groupBadgePreview;
    link.download = `${group.name.replace(/\s+/g, '_')}_Group_Badges.png`;
    link.click();
  };

  if (loading) {
    return <div className="center-loading">{t('teacher.groupDetails.loading', { defaultValue: 'Loading group details...' })}</div>;
  }

  return (
    <div>
      <div className="page-header page-header--spaced">
        <div className="page-header__back-row">
          <button
            type="button"
            className="btn btn-secondary btn--icon-square"
            onClick={() => navigate('/teacher/groups')}
            aria-label={t('teacher.groupDetails.backToGroups', { defaultValue: 'Back to groups' })}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{group?.name}</h1>
            <p className="page-subtitle">{t('teacher.groupDetails.academicYear', { defaultValue: 'Academic Year:' })} {formatAcademicYear(group?.year)}</p>
          </div>
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-main-stack">
          <div className="card panel-section">
            <div className="panel-section__head">
              <h2 className="panel-section__title">
                <Users size={20} />
                {t('teacher.groupDetails.enrolledStudents', { defaultValue: 'Enrolled Students' })} ({students.length})
              </h2>
              <button
                type="button"
                className="btn btn-primary btn--sm"
                onClick={() => setShowGroupBadgeModal(true)}
                disabled={!students.length}
              >
                <GraduationCap size={16} />
                {t('teacher.groupDetails.generateGroupBadges', { defaultValue: 'Generate Group Badges' })}
              </button>
            </div>

            <div className="stacked-gap">
              {students.length === 0 ? (
                <div className="empty-modal-message">{t('teacher.groupDetails.noStudentsYet', { defaultValue: 'No students have joined this group yet.' })}</div>
              ) : (
                students.map((student) => {
                  const photoUrl = pickStudentPhoto(student);
                  const portfolioUrl = pickPortfolioLink(student);
                  return (
                  <div key={student.id} className="member-row member-row--group-details">
                    <div className="member-row__main">
                      <div className="member-avatar member-avatar--group-details">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={student.name || t('roles.student')}
                            className="member-avatar__img"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          student.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="member-name">{student.name}</div>
                        <div className="member-meta">
                          <span className="member-meta__item"><Mail size={12} /> <span className="member-meta__text">{student.email}</span></span>
                          {portfolioUrl ? (
                            <a
                              className="member-meta__item"
                              href={portfolioUrl}
                              target="_blank"
                              rel="noreferrer"
                              title={t('teacher.groupDetails.openPortfolio', { defaultValue: 'Open portfolio' })}
                            >
                              <LinkIcon size={12} /> <span className="member-meta__text">{t('teacher.groupDetails.portfolio', { defaultValue: 'Portfolio' })}</span>
                            </a>
                          ) : null}
                          <span className="member-meta__item"><Clock size={12} /> <span className="member-meta__text">{formatDate(student.joined_at, language)}</span></span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-icon-danger"
                      onClick={() => handleRemoveStudent(student.id)}
                      title={t('teacher.groupDetails.removeStudent', { defaultValue: 'Remove Student' })}
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                )})
              )}
            </div>
          </div>

          <div className="card panel-section">
            <div className="panel-section__head">
              <h2 className="panel-section__title">
                <BookOpen size={20} />
                {t('teacher.groupDetails.assignedModules', { defaultValue: 'Assigned Modules' })} ({modules.length})
              </h2>
              <button type="button" className="btn btn-primary btn--sm" onClick={() => setShowModuleModal(true)}>
                <Plus size={16} /> {t('teacher.groupDetails.assignModule', { defaultValue: 'Assign Module' })}
              </button>
            </div>

            <div className="module-grid">
              {modules.length === 0 ? (
                <div className="module-grid__empty">{t('teacher.groupDetails.noModules', { defaultValue: 'No modules assigned to this group yet.' })}</div>
              ) : (
                modules.map((mod) => (
                  <div key={mod.id} className="module-row">
                    <div className="module-row__info">
                      <div className="module-icon-sm">
                         <BookOpen size={16} />
                      </div>
                      <span className="module-title">{mod.title}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-unassign"
                      onClick={() => handleUnassignModule(mod.id)}
                      title={t('teacher.groupDetails.removeModule', { defaultValue: 'Remove Module' })}
                    >
                      <X size={18}/>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="card sidebar-card">
          <div className="panel-section__head panel-section__head--only">
            <h2 className="panel-section__title">
              <Share2 size={20} />
              {t('teacher.groupDetails.invitation', { defaultValue: 'Invitation' })}
            </h2>
          </div>

          <div className="sidebar-stack">
            <div>
              <div className="invite-label">{t('teacher.groupDetails.inviteCode', { defaultValue: 'Invite Code' })}</div>
              <div className="invite-row">
                <div className="invite-code-box">
                  {group?.invite_code || '---'}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn--sm"
                  onClick={handleGenerateNewCode}
                  title={t('teacher.groupDetails.renewCode', { defaultValue: 'Renew Code' })}
                >
                  {t('teacher.groupDetails.regenerate', { defaultValue: 'Regenerate' })}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="invite-label label-with-icon" htmlFor="invite-expiry">
                <Calendar size={12} /> {t('teacher.groupDetails.expirationDate', { defaultValue: 'Expiration Date' })}
              </label>
              <input
                id="invite-expiry"
                type="datetime-local"
                className="form-input form-input--tight-top"
                value={inviteExpiry}
                onChange={(e) => setInviteExpiry(e.target.value)}
              />
              <p className="field-hint">
                {group?.invite_expires_at
                  ? (new Date(group.invite_expires_at) < new Date()
                      ? <span className="field-hint--error">{t('teacher.groupDetails.codeExpired', { defaultValue: 'Code has expired.' })}</span>
                      : t('teacher.groupDetails.expiresOn', { defaultValue: 'Expires on {{date}}', date: new Date(group.invite_expires_at).toLocaleString() }))
                  : t('teacher.groupDetails.noExpiration', { defaultValue: 'No expiration date set.' })}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn--block"
              onClick={handleUpdateExpiration}
              disabled={updatingExpiry}
            >
              {updatingExpiry ? t('teacher.groupDetails.updating', { defaultValue: 'Updating...' }) : t('teacher.groupDetails.saveExpiration', { defaultValue: 'Save Expiration' })}
            </button>
          </div>
        </div>
      </div>

      {showModuleModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-content--assign">
            <div className="modal-header">
              <h2 className="font-bold">{t('teacher.groupDetails.assignModule', { defaultValue: 'Assign Module' })}</h2>
              <button type="button" className="modal-close" onClick={() => setShowModuleModal(false)} aria-label={t('common.close')}><X size={20}/></button>
            </div>

            <div className="modal-assign-intro">
              <p className="modal-hint">{t('teacher.groupDetails.selectModuleFor', { defaultValue: 'Select a module to assign to {{group}}.', group: group?.name })}</p>

              <div className="assign-list">
                {allModules.filter(am => !modules.some(m => m.id === am.id)).length === 0 ? (
                  <div className="assign-list__empty">{t('teacher.groupDetails.allModulesAssigned', { defaultValue: 'All modules are already assigned.' })}</div>
                ) : (
                  allModules.filter(am => !modules.some(m => m.id === am.id)).map(am => (
                    <div
                      key={am.id}
                      className="assign-pick-row"
                      onClick={() => handleAssignModule(am.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleAssignModule(am.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <span className="assign-pick-row__title">{am.title}</span>
                      <Plus size={16} className="assign-pick-row__icon" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', left: '-20000px', top: 0, pointerEvents: 'none' }}>
        <div
          ref={badgeSheetRef}
          style={{
            background: '#e2e8f0',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: `${PAGE_GAP}px`,
            width: 'fit-content',
          }}
        >
          {badgePages.map((page, pageIndex) => (
            <div
              key={`badge-page-${pageIndex}`}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '18px',
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: `repeat(${badgesPerRow}, ${SCALED_BADGE_WIDTH}px)`,
                gridTemplateRows: `repeat(${badgesPerColumn}, ${SCALED_BADGE_HEIGHT}px)`,
                columnGap: `${BADGE_GAP}px`,
                rowGap: `${BADGE_GAP}px`,
              }}
            >
              {Array.from({ length: badgesPerPage }).map((_, index) => {
                const student = page[index];
                return (
                  <div
                    key={`badge-slot-${pageIndex}-${index}`}
                    style={{
                      width: `${SCALED_BADGE_WIDTH}px`,
                      height: `${SCALED_BADGE_HEIGHT}px`,
                      overflow: 'hidden',
                    }}
                  >
                    {student ? (
                      <div
                        style={{
                          width: `${BADGE_WIDTH}px`,
                          height: `${BADGE_HEIGHT}px`,
                          transform: `scale(${BADGE_SCALE})`,
                          transformOrigin: 'top left',
                        }}
                      >
                        <BadgeTemplate
                          student={student}
                          group={group}
                          qrCodeDataUrl={badgeQrCodes[student.id] || ''}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {showGroupBadgeModal && (
        <div className="modal-overlay" onClick={closeGroupBadgeModal}>
          <div className="modal-content badge-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2 className="font-bold">
                {t('teacher.groupDetails.generateGroupBadges', { defaultValue: 'Generate Group Badges' })}
              </h2>
              <button
                type="button"
                className="modal-close"
                onClick={closeGroupBadgeModal}
                disabled={isGeneratingGroupBadge}
                aria-label={t('common.close')}
              >
                <X size={20} />
              </button>
            </div>

            <div className="stacked-gap">
              <p className="modal-hint">
                {t('teacher.groupDetails.groupBadgesHint', {
                  defaultValue: 'Generate one image containing all student badges. Adjust the grid to control layout.',
                })}
              </p>

              <div className="form-row-split">
                <div className="form-group">
                  <label className="form-label" htmlFor="badges-per-row">
                    {t('teacher.groupDetails.badgesPerRow', { defaultValue: 'Badges Per Row' })}
                  </label>
                  <input
                    id="badges-per-row"
                    type="number"
                    className="form-input"
                    min={1}
                    max={8}
                    value={badgesPerRow}
                    onChange={(event) => setBadgesPerRow(Math.min(8, Math.max(1, Number(event.target.value) || 1)))}
                    disabled={isGeneratingGroupBadge}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="badges-per-column">
                    {t('teacher.groupDetails.badgesPerColumn', { defaultValue: 'Badges Per Column' })}
                  </label>
                  <input
                    id="badges-per-column"
                    type="number"
                    className="form-input"
                    min={1}
                    max={8}
                    value={badgesPerColumn}
                    onChange={(event) => setBadgesPerColumn(Math.min(8, Math.max(1, Number(event.target.value) || 1)))}
                    disabled={isGeneratingGroupBadge}
                  />
                </div>
              </div>

              {!groupBadgePreview ? (
                <button
                  type="button"
                  className="btn btn-primary btn--block"
                  onClick={generateGroupBadgesImage}
                  disabled={isGeneratingGroupBadge || students.length === 0}
                >
                  {isGeneratingGroupBadge ? <Loader size={18} className="spin" /> : <GraduationCap size={18} />}
                  {isGeneratingGroupBadge
                    ? t('teacher.groupDetails.generatingGroupBadges', { defaultValue: 'Generating...' })
                    : t('teacher.groupDetails.generateImage', { defaultValue: 'Generate Image' })}
                </button>
              ) : (
                <div className="badge-preview-container">
                  <img src={groupBadgePreview} alt="Group badges preview" className="badge-preview-img" />
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeGroupBadgeModal}>
                {t('common.cancel', { defaultValue: 'Cancel' })}
              </button>
              {groupBadgePreview ? (
                <>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={generateGroupBadgesImage}
                    disabled={isGeneratingGroupBadge}
                  >
                    {isGeneratingGroupBadge
                      ? t('teacher.groupDetails.generatingGroupBadges', { defaultValue: 'Generating...' })
                      : t('teacher.groupDetails.regenerate', { defaultValue: 'Regenerate' })}
                  </button>
                  <button type="button" className="btn btn-primary" onClick={downloadGroupBadges}>
                    <Save size={18} />
                    {t('common.download', { defaultValue: 'Download' })}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
