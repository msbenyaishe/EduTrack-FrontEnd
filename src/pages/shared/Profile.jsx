import React, { useState, useEffect } from 'react';
import { User, Mail, Link as LinkIcon, FileText, Lock, Save, Camera, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { useTranslation } from 'react-i18next';
import '../../styles/profile.css';

const Profile = () => {
  const { user, login } = useAuth();
  const { t } = useTranslation();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
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

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
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
        <aside className="card sidebar-card profile-sidebar-card profile-sidebar-card--minimal" aria-label={t('profile.title', { defaultValue: 'My Profile' })}>
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
    </div>
  );
};

export default Profile;
