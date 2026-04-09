import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import '../styles/dashboard.css';

const TeacherLayout = () => {
  return (
    <div className="layout-container">
      <Sidebar role="teacher" />
      <div className="layout-content">
        <Navbar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
