import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../service/authservice'

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
useEffect(() => {
  let isMounted = true; // Prevent state updates if component unmounts

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated() && !authService.isTokenExpired()) {
        // Access token present and valid
        const currentUser = authService.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } else {
        // Access token missing or expired; try to refresh
        const resp = await authService.refreshToken();
        if (resp.success) {
          // Token refreshed, set user with new data
          const newUser = authService.getCurrentUser();
          if (isMounted) {
            setUser(newUser);
            setIsAuthenticated(true);
          }
        } else {
          // Refresh failed (refresh token expired/invalid)
          authService.clearAuth();
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      if (isMounted) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      if (isMounted) setIsLoading(false);
    }
  };

  checkAuth();

  // Cleanup function (avoids state updates if unmounted)
  return () => { isMounted = false };
}, []);


  const login = async (credentials) => {
    setIsLoading(true);

    try {
      const result = await authService.login(credentials);
      console.log(result);
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return result;
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.log(error);
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return result;
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      // Even if logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: 'Logout failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};