import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const getInitialUser = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || !role) return null;

  return {
    token,
    role,
    id: localStorage.getItem('userId') || undefined,
    name: localStorage.getItem('userName') || undefined,
    personal_image: localStorage.getItem('personalImage') || undefined,
    portfolio_link: localStorage.getItem('portfolioLink') || undefined,
    additional_profile_data: localStorage.getItem('additionalProfileData') || undefined,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('personalImage');
    localStorage.removeItem('portfolioLink');
    localStorage.removeItem('additionalProfileData');
    setUser(null);
  };

  const login = (userData) => {
    if (userData.token) localStorage.setItem('token', userData.token);
    if (userData.role) localStorage.setItem('role', userData.role);
    if (userData.id) localStorage.setItem('userId', userData.id);
    if (userData.name) localStorage.setItem('userName', userData.name);
    if (userData.personal_image) localStorage.setItem('personalImage', userData.personal_image);
    if (userData.portfolio_link) localStorage.setItem('portfolioLink', userData.portfolio_link);
    if (userData.additional_profile_data) localStorage.setItem('additionalProfileData', userData.additional_profile_data);
    
    setUser((prev) => ({ ...(prev || {}), ...userData }));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    setUser(getInitialUser());
    setLoading(false);
    if (!token || !role) return;

    // Keep UI responsive: refresh auth profile in background.
    api
      .get('/auth/me')
      .then((response) => {
        const me = response?.data || {};
        if (me.portfolio_link) localStorage.setItem('portfolioLink', me.portfolio_link);
        if (me.additional_profile_data) localStorage.setItem('additionalProfileData', me.additional_profile_data);
        if (me.name) localStorage.setItem('userName', me.name);
        if (me.personal_image) localStorage.setItem('personalImage', me.personal_image);
        
        setUser((prev) => ({ ...(prev || {}), ...me, token, role: me.role || role }));
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          logout();
        }
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
