import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    console.log("Logging out...");
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
    
    setUser(userData);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      if (token && role) {
        try {
          const response = await api.get('/auth/me');
          setUser({ ...response.data, token });
        } catch (err) {
          console.error("Auth initialization failed:", err);
          if (err.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {loading ? (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
          <div className="skeleton" style={{ width: '120px', height: '40px' }}></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
