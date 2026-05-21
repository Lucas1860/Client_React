import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        // Можно также загрузить /users/me для получения роли
        authAPI.getCurrentUser().then(userData => setUser(userData)).catch(() => {});
      } catch (e) {
        logout();
      }
    } else {
      setUser(null);
      setUserId(null);
    }
  }, [token]);

  const login = async (username, password) => {
    const res = await authAPI.login(username, password);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    return res;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, userId, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);