import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="public-layout">
      {/* Could add a public facing Navbar here */}
      <Outlet />
    </div>
  );
};

export default PublicLayout;
