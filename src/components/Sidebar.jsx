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
  GraduationCap 
} from 'lucide-react';
import '../styles/sidebar.css';

const Sidebar = ({ role }) => {
  const teacherLinks = [
    { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teacher/modules', icon: BookOpen, label: 'Modules' },
    { to: '/teacher/groups', icon: Users, label: 'Groups' },
    { to: '/teacher/workshops', icon: Briefcase, label: 'Workshops' },
    { to: '/teacher/agile', icon: CheckSquare, label: 'Agile Teams' },
    { to: '/teacher/pfe', icon: GraduationCap, label: 'PFE' },
    { to: '/teacher/internships', icon: FileBox, label: 'Internships' },
    { to: '/teacher/submissions', icon: Upload, label: 'Submissions' },
  ];

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/modules', icon: BookOpen, label: 'My Modules' },
    { to: '/student/groups', icon: Users, label: 'My Groups' },
    { to: '/student/workshops', icon: Briefcase, label: 'Workshops' },
    { to: '/student/agile', icon: CheckSquare, label: 'Agile Teams' },
    { to: '/student/pfe', icon: GraduationCap, label: 'PFE' },
    { to: '/student/internships', icon: FileBox, label: 'Internship' },
    { to: '/student/submissions', icon: Upload, label: 'My Submissions' },
  ];

  const links = role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <BookOpen className="logo-icon" size={28} />
          <span>EduTrack</span>
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
            >
              <Icon size={20} className="link-icon" />
              <span className="link-label">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="sidebar-footer">
        <span className="version">EduTrack v1.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
