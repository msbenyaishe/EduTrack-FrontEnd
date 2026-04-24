import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const personalImage = localStorage.getItem('personalImage');
    const portfolioLink = localStorage.getItem('portfolioLink');
    const additionalProfileData = localStorage.getItem('additionalProfileData');

    if (token && role) {
      return { 
        token, 
        role, 
        id: userId, 
        name: userName, 
        personal_image: personalImage,
        portfolio_link: portfolioLink,
        additional_profile_data: additionalProfileData
      };
    }
    return null;
  });
  
  const [loading, setLoading] = useState(!localStorage.getItem('token'));

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        const updatedData = { ...response.data, token };
        setUser(updatedData);
        
        // Update localStorage with latest data
        localStorage.setItem('userName', response.data.name);
        if (response.data.personal_image) {
          localStorage.setItem('personalImage', response.data.personal_image);
        } else {
          localStorage.removeItem('personalImage');
        }
        
        if (response.data.portfolio_link) localStorage.setItem('portfolioLink', response.data.portfolio_link);
        if (response.data.additional_profile_data) localStorage.setItem('additionalProfileData', response.data.additional_profile_data);
      } catch (err) {
        console.error("Failed to refresh user data:", err);
        if (err.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = (userData) => {
    if (userData.token) localStorage.setItem('token', userData.token);
    if (userData.role) localStorage.setItem('role', userData.role);
    if (userData.id) localStorage.setItem('userId', userData.id);
    if (userData.name) localStorage.setItem('userName', userData.name);
    if (userData.personal_image) localStorage.setItem('personalImage', userData.personal_image);
    if (userData.portfolio_link) localStorage.setItem('portfolioLink', userData.portfolio_link);
    if (userData.additional_profile_data) localStorage.setItem('additionalProfileData', userData.additional_profile_data);
    
    setUser(prev => ({
      ...prev,
      ...userData
    }));
  };

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

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
