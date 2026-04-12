import React from 'react';
import { LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar = ({ onMenuClick, navOpen = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
            aria-label="Open navigation menu"
            aria-expanded={navOpen}
            aria-controls="app-sidebar"
          >
            <Menu size={22} strokeWidth={2} />
          </button>
        )}
        <h2 className="navbar-greeting">
          Hello, {user?.name || 'User'}
        </h2>
      </div>
      
      <div className="navbar-right">
        
        <div className="user-profile">
          <div className="avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role capitalize">{user?.role}</span>
          </div>
        </div>

        <button 
          className="icon-btn logout-btn" 
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
