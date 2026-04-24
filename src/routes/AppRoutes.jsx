import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import TeacherLayout from '../layouts/TeacherLayout';
import StudentLayout from '../layouts/StudentLayout';
import PublicLayout from '../layouts/PublicLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// Public / auth
import Landing from '../pages/public/Landing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/Dashboard';
import TeacherGroups from '../pages/teacher/Groups';
import TeacherGroupDetails from '../pages/teacher/GroupDetails';
import TeacherModules from '../pages/teacher/Modules';
import TeacherWorkshops from '../pages/teacher/Workshops';
import TeacherAgile from '../pages/teacher/Agile';
import TeacherPFE from '../pages/teacher/PFE';
import TeacherInternships from '../pages/teacher/Internships';
import TeacherSubmissions from '../pages/teacher/Submissions';

// Student Pages
import StudentDashboard from '../pages/student/Dashboard';
import StudentModules from '../pages/student/Modules';
import StudentGroups from '../pages/student/Groups';
import StudentWorkshops from '../pages/student/Workshops';
import StudentAgile from '../pages/student/Agile';
import StudentPFE from '../pages/student/PFE';
import StudentInternships from '../pages/student/Internships';
import StudentSubmissions from '../pages/student/Submissions';

// Shared Pages
import Companies from '../pages/shared/Companies';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Landing />} />
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Route>

      {/* Teacher Routes */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route element={<TeacherLayout />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/groups" element={<TeacherGroups />} />
          <Route path="/teacher/groups/:id" element={<TeacherGroupDetails />} />
          <Route path="/teacher/modules" element={<TeacherModules />} />
          <Route path="/teacher/workshops" element={<TeacherWorkshops />} />
          <Route path="/teacher/agile" element={<TeacherAgile />} />
          <Route path="/teacher/pfe" element={<TeacherPFE />} />
          <Route path="/teacher/internships" element={<TeacherInternships />} />
          <Route path="/teacher/companies" element={<Companies />} />
          <Route path="/teacher/submissions" element={<TeacherSubmissions />} />
        </Route>
      </Route>

      {/* Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/modules" element={<StudentModules />} />
          <Route path="/student/groups" element={<StudentGroups />} />
          <Route path="/student/workshops" element={<StudentWorkshops />} />
          <Route path="/student/agile" element={<StudentAgile />} />
          <Route path="/student/pfe" element={<StudentPFE />} />
          <Route path="/student/internships" element={<StudentInternships />} />
          <Route path="/student/companies" element={<Companies />} />
          <Route path="/student/submissions" element={<StudentSubmissions />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
