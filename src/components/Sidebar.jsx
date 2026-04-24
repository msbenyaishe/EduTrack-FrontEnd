import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Briefcase, 
  CheckSquare, 
  Upload, 
  FileBox, 
  GraduationCap,
  Building
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../styles/sidebar.css';

const Sidebar = ({ role, onNavigate, id }) => {
  const { t } = useTranslation();
  const teacherLinks = [
    { to: '/teacher/dashboard', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { to: '/teacher/modules', icon: BookOpen, label: t('sidebar.modules') },
    { to: '/teacher/groups', icon: Users, label: t('sidebar.groups') },
    { to: '/teacher/workshops', icon: Briefcase, label: t('sidebar.workshops') },
    { to: '/teacher/agile', icon: CheckSquare, label: t('sidebar.agileTeams') },
    { to: '/teacher/pfe', icon: GraduationCap, label: t('sidebar.pfe') },
    { to: '/teacher/internships', icon: FileBox, label: t('sidebar.internships') },
    { to: '/teacher/companies', icon: Building, label: t('sidebar.companies', { defaultValue: 'Companies' }) },
    { to: '/teacher/submissions', icon: Upload, label: t('sidebar.submissions') },
  ];

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { to: '/student/modules', icon: BookOpen, label: t('sidebar.myModules') },
    { to: '/student/groups', icon: Users, label: t('sidebar.myGroups') },
    { to: '/student/workshops', icon: Briefcase, label: t('sidebar.workshops') },
    { to: '/student/agile', icon: CheckSquare, label: t('sidebar.agileTeams') },
    { to: '/student/pfe', icon: GraduationCap, label: t('sidebar.pfe') },
    { to: '/student/internships', icon: FileBox, label: t('sidebar.internship') },
    { to: '/student/companies', icon: Building, label: t('sidebar.companies', { defaultValue: 'Companies' }) },
    { to: '/student/submissions', icon: Upload, label: t('sidebar.mySubmissions') },
  ];

  const links = role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <aside className="sidebar" id={id} aria-label={t('nav.mainNavigation')}>
      <div className="sidebar-header">
        <div className="logo">
          <BookOpen className="logo-icon" size={28} />
          <span>{t('common.appName')}</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {links.map((link, index) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={index}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate?.()}
            >
              <Icon size={20} className="link-icon" />
              <span className="link-label">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="sidebar-footer">
        <span className="version">{t('common.appName')} v1.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
