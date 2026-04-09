import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import '../styles/dashboard.css';

const StudentLayout = () => {
  return (
    <div className="layout-container">
      <Sidebar role="student" />
      <div className="layout-content">
        <Navbar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
