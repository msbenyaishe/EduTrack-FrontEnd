import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const TeacherLayout = () => {
  return (
    <DashboardLayout role="teacher">
      <Outlet />
    </DashboardLayout>
  );
};

export default TeacherLayout;
