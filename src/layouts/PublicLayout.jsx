import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import '../styles/public.css';
import '../styles/auth.css';

const authPaths = ['/login', '/register'];

const PublicLayout = () => {
  const { pathname } = useLocation();
  const isAuthPage = authPaths.includes(pathname);

  return (
    <div className="public-shell">
      <PublicNavbar />
      <main
        className={`public-shell__main${isAuthPage ? ' public-shell__main--auth' : ''}`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
