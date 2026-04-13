import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    if (token && role) {
      setUser({ token, role, id: userId, name: userName });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('role', userData.role);
    if(userData.id) localStorage.setItem('userId', userData.id);
    if(userData.name) localStorage.setItem('userName', userData.name);
    
    setUser({
      token: userData.token,
      role: userData.role,
      id: userData.id,
      name: userData.name
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
