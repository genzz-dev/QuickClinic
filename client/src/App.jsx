import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from './context/authContext';
import getDashboardPath from './utility/getDashboardPath';

import AuthRoutes from './routes/AuthRoutes';
import PublicRoutes from './routes/PublicRoutes';
import AdminRoutes from './routes/AdminRoutes';
import PatientRoutes from './routes/PatientRoutes';
import DoctorRoutes from './routes/DoctorRoutes';

function AppInner() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [registerError, setRegisterError] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (location.pathname === '/') {
        navigate(getDashboardPath(user.role), { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, location.pathname, navigate]);

  if (isLoading) return null;

  return (
    <>
      <AuthRoutes
        registerError={registerError}
        setRegisterError={setRegisterError}
        loginError={loginError}
        setLoginError={setLoginError}
      />
      <PublicRoutes />
      <AdminRoutes />
      <PatientRoutes />
      <DoctorRoutes />
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
  
      <AppInner />
    
  );
}
