import React, { useState, useEffect } from 'react';
import { User, Mail, Link as LinkIcon, FileText, Lock, Save, Camera, Loader, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { useTranslation } from 'react-i18next';
import '../../styles/profile.css';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import BadgeTemplate from '../../components/BadgeTemplate';
import { studentService } from '../../services/studentService';

const Profile = () => {
  const { user, login } = useAuth();
  const { t } = useTranslation();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    portfolio_link: user?.portfolio_link || '',
    additional_profile_data: user?.additional_profile_data || '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.personal_image || null);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Badge State
  const [isGeneratingBadge, setIsGeneratingBadge] = useState(false);
  const [badgePreview, setBadgePreview] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [studentGroups, setStudentGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const badgeRef = React.useRef(null);
  const waitForBadgeRender = () =>
    new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        portfolio_link: user.portfolio_link || '',
        additional_profile_data: user.additional_profile_data || '',
      });
      setImagePreview(user.personal_image || null);
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('email', profileData.email);
      if (user.role === 'student') {
        formData.append('portfolio_link', profileData.portfolio_link);
        formData.append('additional_profile_data', profileData.additional_profile_data);
      }
      if (selectedImage) {
        formData.append('personal_image', selectedImage);
      }

      const response = await authService.updateProfile(formData);
      
      // Update local user state
      const updatedUser = { ...user, ...response };
      login(updatedUser);
      
      setMessage({ type: 'success', text: t('profile.updateSuccess', { defaultValue: 'Profile updated successfully!' }) });
      setSelectedImage(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('profile.updateError', { defaultValue: 'Failed to update profile.' }) });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: t('profile.passwordMismatch', { defaultValue: 'Passwords do not match.' }) });
      return;
    }

    setIsChangingPassword(true);
    setMessage({ type: '', text: '' });

    try {
      await authService.updatePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: t('profile.passwordSuccess', { defaultValue: 'Password updated successfully!' }) });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('profile.passwordError', { defaultValue: 'Failed to update password.' }) });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const prepareBadge = async () => {
    if (user.role !== 'student') return;
    
    setIsGeneratingBadge(true);
    try {
      const groups = await studentService.getMyGroups();
      setStudentGroups(groups);
      
      if (groups.length === 1) {
        setSelectedGroup(groups[0]);
        generateBadgeImage(groups[0]);
      } else if (groups.length > 1) {
        setShowBadgeModal(true);
        // User will select a group in the modal
      } else {
        // No groups, but can still generate a general badge
        generateBadgeImage(null);
      }
    } catch (err) {
      console.error("Failed to fetch groups for badge:", err);
      setMessage({ type: 'error', text: t('profile.badgeError', { defaultValue: 'Failed to prepare badge data.' }) });
    } finally {
      setIsGeneratingBadge(false);
    }
  };

  const generateBadgeImage = async (group) => {
    setIsGeneratingBadge(true);
    try {
      let generatedQrCode = '';

      // Generate QR code if portfolio exists
      if (user.portfolio_link) {
        generatedQrCode = await QRCode.toDataURL(user.portfolio_link, {
          width: 200,
          margin: 0,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });
      }
      setQrCodeUrl(generatedQrCode);

      // Wait for React state to paint before snapshot.
      await waitForBadgeRender();

      if (!badgeRef.current) {
        throw new Error('Badge template is not ready for capture.');
      }

      const canvas = await html2canvas(badgeRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null
      });
      const image = canvas.toDataURL('image/png');
      setBadgePreview(image);
      setShowBadgeModal(true);
    } catch (err) {
      console.error("Badge generation error:", err);
      setMessage({ type: 'error', text: t('profile.badgeGenError', { defaultValue: 'Failed to generate badge image.' }) });
    } finally {
      setIsGeneratingBadge(false);
    }
  };

  const downloadBadge = () => {
    if (!badgePreview) return;
    const link = document.createElement('a');
    link.download = `${user.name.replace(/\s+/g, '_')}_Badge.png`;
    link.href = badgePreview;
    link.click();
    
    // Requirements: disappear after download
    closeBadgeModal();
  };

  const closeBadgeModal = () => {
    setShowBadgeModal(false);
    setBadgePreview(null);
    setSelectedGroup(null);
    setQrCodeUrl('');
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('profile.title', { defaultValue: 'My Profile' })}</h1>
          <p className="page-subtitle">{t('profile.subtitle', { defaultValue: 'Manage your account settings and personal informations.' })}</p>
        </div>
      </div>

      {message.text && (
        message.type === 'success' ? (
          <div className="status-banner" style={{ marginBottom: '1.5rem' }}>
            {message.text}
          </div>
        ) : (
          <div className="alert alert--danger" style={{ marginBottom: '1.5rem' }}>
            {message.text}
          </div>
        )
      )}

      <div className="detail-layout profile-detail-layout">
        <aside className="sidebar-card profile-sidebar-card profile-sidebar-card--minimal profile-sidebar-card--transparent" aria-label={t('profile.title', { defaultValue: 'My Profile' })}>
          <div className="profile-minimal">
            <div className={`profile-avatar-minimal ${imagePreview ? 'profile-avatar-minimal--has-image' : 'profile-avatar-minimal--empty'}`}>
              {imagePreview ? (
                <img src={imagePreview} alt={user?.name} />
              ) : (
                <div className="avatar-placeholder">
                  {user?.name?.charAt(0).toUpperCase() || <User size={36} />}
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="avatar-upload-btn avatar-upload-btn--minimal"
                title={t('profile.changePhoto', { defaultValue: 'Change photo' })}
              >
                <Camera size={18} />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <h2 className="profile-minimal__name">{user?.name}</h2>
            <span className="badge badge-primary capitalize profile-role-badge">
              {t(`roles.${user?.role}`)}
            </span>

            <div className="profile-minimal__email">
              <Mail size={18} className="info-icon" />
              <span className="profile-email">{user?.email}</span>
            </div>

            {user?.role === 'student' && (
              <button 
                type="button" 
                className="btn btn-primary badge-gen-btn"
                onClick={prepareBadge}
                disabled={isGeneratingBadge}
              >
                {isGeneratingBadge ? <Loader size={18} className="spin" /> : <GraduationCap size={18} />}
                {t('profile.generateBadge', { defaultValue: 'Generate Badge' })}
              </button>
            )}
          </div>
        </aside>

        <div className="detail-main-stack">
          <div className="card panel-section">
            <div className="panel-section__head">
              <h3 className="panel-section__title">{t('profile.personalInfo', { defaultValue: 'Personal Information' })}</h3>
            </div>

            <form onSubmit={handleProfileSubmit} className="stacked-gap">
              <div className="form-group">
                <label className="form-label">{t('auth.fullName', { defaultValue: 'Full Name' })}</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder={t('profile.placeholders.fullName', { defaultValue: 'Enter your full name' })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.email', { defaultValue: 'Email Address' })}</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    className="form-input"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder={t('profile.placeholders.email', { defaultValue: 'Enter your email address' })}
                    required
                  />
                </div>
              </div>

              {user?.role === 'student' && (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('profile.portfolio', { defaultValue: 'Portfolio Link' })}</label>
                    <div className="input-with-icon">
                      <LinkIcon size={18} className="input-icon" />
                      <input
                        type="url"
                        className="form-input"
                        value={profileData.portfolio_link}
                        onChange={(e) => setProfileData({ ...profileData, portfolio_link: e.target.value })}
                        placeholder={t('profile.placeholders.portfolio', { defaultValue: 'https://your-portfolio.com' })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('profile.bio', { defaultValue: 'Additional Profile Data' })}</label>
                    <div className="input-with-icon align-top">
                      <FileText size={18} className="input-icon" />
                      <textarea
                        className="form-input"
                        rows="4"
                        value={profileData.additional_profile_data}
                        onChange={(e) => setProfileData({ ...profileData, additional_profile_data: e.target.value })}
                        placeholder={t('profile.placeholders.additionalData', { defaultValue: 'Tell us about yourself...' })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="modal-footer modal-footer--mt">
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? <Loader size={18} className="spin" /> : <Save size={18} />}
                  {t('common.saveChanges', { defaultValue: 'Save Changes' })}
                </button>
              </div>
            </form>
          </div>

          <div className="card panel-section">
            <div className="panel-section__head">
              <h3 className="panel-section__title">{t('profile.changePassword', { defaultValue: 'Change Password' })}</h3>
            </div>

            <form onSubmit={handlePasswordSubmit} className="stacked-gap">
              <div className="form-group">
                <label className="form-label">{t('profile.oldPassword', { defaultValue: 'Current Password' })}</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  placeholder={t('profile.placeholders.currentPassword', { defaultValue: 'Enter your current password' })}
                  required
                />
              </div>

              <div className="form-row-split">
                <div className="form-group">
                  <label className="form-label">{t('profile.newPassword', { defaultValue: 'New Password' })}</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder={t('profile.placeholders.newPassword', { defaultValue: 'Create a new password' })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('profile.confirmPassword', { defaultValue: 'Confirm New Password' })}</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder={t('profile.placeholders.confirmPassword', { defaultValue: 'Re-enter new password' })}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="modal-footer modal-footer--mt">
                <button type="submit" className="btn btn-primary" disabled={isChangingPassword}>
                  {isChangingPassword ? <Loader size={18} className="spin" /> : <Lock size={18} />}
                  {t('profile.updatePassword', { defaultValue: 'Update Password' })}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Badge Generation UI (Hidden until capture) */}
      <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
        <BadgeTemplate 
          ref={badgeRef} 
          student={user} 
          group={selectedGroup} 
          qrCodeDataUrl={qrCodeUrl} 
        />
      </div>

      {/* Badge Modal */}
      {showBadgeModal && (
        <div className="modal-overlay" onClick={closeBadgeModal}>
          <div className="modal-content badge-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {badgePreview ? t('profile.badgePreview', { defaultValue: 'Your Student Badge' }) : t('profile.selectGroup', { defaultValue: 'Select Group' })}
              </h3>
              <button className="modal-close" onClick={closeBadgeModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              {!badgePreview && studentGroups.length > 1 ? (
                <div className="group-selection-list">
                  <p className="modal-subtitle">{t('profile.badgeGroupPrompt', { defaultValue: 'Which group should be displayed on your badge?' })}</p>
                  {studentGroups.map(group => (
                    <button 
                      key={group.id} 
                      className="group-select-item"
                      onClick={() => {
                        setSelectedGroup(group);
                        generateBadgeImage(group);
                      }}
                    >
                      <span className="group-select-name">{group.name}</span>
                      <span className="group-select-year">{group.academic_year}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="badge-preview-container">
                  {badgePreview ? (
                    <>
                      <img src={badgePreview} alt={t('profile.badgePreviewAlt', { defaultValue: 'Badge Preview' })} className="badge-preview-img" />
                      <p className="badge-note">{t('profile.badgeNote', { defaultValue: 'This preview is temporary. Please download it now.' })}</p>
                    </>
                  ) : (
                    <div className="badge-loading">
                      <Loader size={48} className="spin" />
                      <p>{t('profile.generating', { defaultValue: 'Generating your badge...' })}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeBadgeModal}>
                {t('common.cancel', { defaultValue: 'Cancel' })}
              </button>
              {badgePreview && (
                <button className="btn btn-primary" onClick={downloadBadge}>
                  <Save size={18} />
                  {t('common.download', { defaultValue: 'Download' })}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
