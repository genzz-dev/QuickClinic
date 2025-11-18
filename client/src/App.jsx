import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Loading from './components/ui/Loading';
import { useAuth } from './context/authContext';
import AdminRoutes from './routes/AdminRoutes';
import AuthRoutes from './routes/AuthRoutes';
import DoctorRoutes from './routes/DoctorRoutes';
import PatientRoutes from './routes/PatientRoutes';
import PublicRoutes from './routes/PublicRoutes';
import getDashboardPath from './utility/getDashboardPath';

// App.jsx - Updated AppInner component
function AppInner() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [registerError, setRegisterError] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Handle root path redirect
      if (location.pathname === '/') {
        navigate(getDashboardPath(user.role), { replace: true });
        return;
      }

      // Handle post-login redirects from auth routes
      if (location.pathname.includes('/login') || location.pathname.includes('/register')) {
        navigate(getDashboardPath(user.role), { replace: true });
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, location.pathname, navigate]);

  if (isLoading) return <Loading />;

  // Conditional rendering with better route handling
  const renderRoutes = () => {
    console.log('Auth state:', { isAuthenticated, isLoading, user, pathname: location.pathname });

    // For authenticated users
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'admin':
          return <AdminRoutes />;
        case 'patient':
          return <PatientRoutes />;
        case 'doctor':
          return <DoctorRoutes />;
        default:
          // Fallback for unknown roles
          navigate('/', { replace: true });
          return <PublicRoutes />;
      }
    }

    // For non-authenticated users
    // Check if on auth routes
    if (
      location.pathname.includes('/login') ||
      location.pathname.includes('/register') ||
      location.pathname.includes('/auth')
    ) {
      return (
        <AuthRoutes
          registerError={registerError}
          loginError={loginError}
          setLoginError={setLoginError}
          setRegisterError={setRegisterError}
        />
      );
    }

    // Default to public routes
    return <PublicRoutes />;
  };

  return (
    <>
      {renderRoutes()}
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <>
      <AppInner />
    </>
  );
}
