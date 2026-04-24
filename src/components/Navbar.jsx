import React from 'react';
import { LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import '../styles/navbar.css';

const Navbar = ({ onMenuClick, navOpen = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || 'en';
  const isArabic = language === 'ar';
  const roleLabel = user?.role ? t(`roles.${user.role}`) : t('roles.user');
  const userName = user?.name || t('roles.user');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        {onMenuClick && (
          <button
            type="button"
            className="navbar-menu-btn"
            onClick={onMenuClick}
            aria-label={t('nav.openNavigationMenu')}
            aria-expanded={navOpen}
            aria-controls="app-sidebar"
          >
            <Menu size={22} strokeWidth={2} />
          </button>
        )}
        <h2 className="navbar-greeting">
          {isArabic ? (
            <>
              <span>{userName}</span>
              <span aria-hidden> ،</span>
              <span lang="ar">{t('nav.arHello', { defaultValue: 'مرحبا' })}</span>
            </>
          ) : (
            t('nav.greeting', { name: userName })
          )}
        </h2>
      </div>
      
      <div className="navbar-right">
        <LanguageSwitcher compact />
        
        <div 
          className="user-profile" 
          onClick={() => navigate(`/${user?.role}/profile`)}
          style={{ cursor: 'pointer' }}
          title={t('profile.viewProfile', { defaultValue: 'View Profile' })}
        >
          <div className={`avatar${user?.personal_image ? ' avatar--has-image' : ''}`}>
            {user?.personal_image ? (
              <img src={user.personal_image} alt={userName} className="avatar-img" />
            ) : (
              user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />
            )}
          </div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-role capitalize">{roleLabel}</span>
          </div>
        </div>

        <button 
          className="icon-btn logout-btn" 
          onClick={handleLogout}
          aria-label={t('nav.logout')}
          title={t('nav.logout')}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
