import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing user on component mount
  useEffect(() => {
    const checkAuthUser = () => {
      const user = JSON.parse(localStorage.getItem('authUser')) || JSON.parse(sessionStorage.getItem('authUser'));
      setCurrentUser(user);
      setLoading(false);
    };
    
    checkAuthUser();
  }, []);

  // Login function
  const login = (userData, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('authUser', JSON.stringify(userData));
    setCurrentUser(userData);
    navigate('/dashboard');
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authUser');
    sessionStorage.removeItem('authUser');
    setCurrentUser(null);
    navigate('/login');
  };

  // Value object to be provided to consumers
  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using the auth context
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
