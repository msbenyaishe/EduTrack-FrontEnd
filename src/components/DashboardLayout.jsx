import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import '../styles/dashboard.css';

/**
 * Shared shell for teacher/student dashboards: mobile sidebar drawer + backdrop.
 */
const DashboardLayout = ({ role, children }) => {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1025px)');
    const onChange = (e) => {
      if (e.matches) setNavOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (navOpen) {
      document.body.classList.add('layout-scroll-lock');
    } else {
      document.body.classList.remove('layout-scroll-lock');
    }
    return () => document.body.classList.remove('layout-scroll-lock');
  }, [navOpen]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navOpen]);

  const closeNav = () => setNavOpen(false);

  return (
    <div className={`layout-container${navOpen ? ' layout-container--nav-open' : ''}`}>
      <button
        type="button"
        className="sidebar-backdrop"
        aria-label="Close navigation menu"
        tabIndex={-1}
        onClick={closeNav}
      />
      <Sidebar role={role} id="app-sidebar" onNavigate={closeNav} />
      <div className="layout-content">
        <Navbar onMenuClick={() => setNavOpen(true)} navOpen={navOpen} />
        <main className="main-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
