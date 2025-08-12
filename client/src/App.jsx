import React, { useEffect,useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';

import Navbar from './components/public/DesktopNavbar';
import MobileBottomBar from './components/public/MobileBottomBar';

import Nearbyclinics from './pages/public/Nearbyclinics';
import ClinicDetailPage from './pages/public/ClinicDetailPage';
import DoctorDetailsPage from './pages/public/DoctorDetailsPage';
import Doctors from './pages/public/Doctors';
import SearchResultsPage from './components/public/SearchResultsPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import QuickClinicHomepage from './pages/public/HomePage';

// Dashboards
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

import { useAuth } from './context/authContext';
import ProtectedRoute from './routes/protectedRoutes';
import AnonymousRoute from './routes/AnonymousRoute';
import getDashboardPath from './utility/getDashboardPath';
import AdminProfileComplete from './pages/admin/AdminProfileComplete';
import AdminClinicAdd from './pages/admin/AdminClinicAdd';
// --- Layouts ---
const MainLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <MobileBottomBar />
  </>
);

const AuthLayout = ({ children }) => <>{children}</>;

// --- App inner for hooks ---
function AppInner() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [registerError, setRegisterError] = useState('');
  const [loginError,setLoginError]=useState('');
  // Redirect from "/" to the role-based dashboard (after auth is loaded)
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (location.pathname === "/") {
        // Redirect to dashboard (role based)
        navigate(getDashboardPath(user.role), { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, location.pathname, navigate]);
  return (
    <Routes>
      {/* AUTH ROUTES - NO NAVBAR */}
      <Route
        path="/login"
        element={
          <AuthLayout>
            <AnonymousRoute>
              <LoginPage error={loginError} setError={setLoginError} />
            </AnonymousRoute>
          </AuthLayout>
        }
      />
      <Route
        path="/register"
        element={
          <AuthLayout>
            <AnonymousRoute>
              <RegisterPage error={registerError} setError={setRegisterError}/>
            </AnonymousRoute>
          </AuthLayout>
        }
      />

      {/* PUBLIC ROUTES - NAVBAR */}
      <Route
        path="/"
        element={
          <MainLayout>
            <QuickClinicHomepage />
          </MainLayout>
        }
      />
      <Route
        path="/nearby"
        element={
          <MainLayout>
            <Nearbyclinics />
          </MainLayout>
        }
      />
      <Route
        path="/clinic/:clinicId"
        element={
          <MainLayout>
            <ClinicDetailPage />
          </MainLayout>
        }
      />
      <Route
        path="/doctors"
        element={
          <MainLayout>
            <Doctors />
          </MainLayout>
        }
      />
      <Route
        path="/doctor/:id"
        element={
          <MainLayout>
            <DoctorDetailsPage />
          </MainLayout>
        }
      />
      <Route
        path="/search"
        element={
          <MainLayout>
            <SearchResultsPage />
          </MainLayout>
        }
      />

      {/* DASHBOARD ROUTES - PROTECTED */}
      <Route
        path="/patient/dashboard"
        element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          </MainLayout>
        }
      />
      <Route
        path="/doctor/dashboard"
        element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          </MainLayout>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <MainLayout>
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          </MainLayout>
        }
      />
      <Route path="/admin/complete-profile" element={<ProtectedRoute allowedRoles={['admin']}><AdminProfileComplete /></ProtectedRoute>} />
      <Route path="/admin/add-clinic" element={<ProtectedRoute allowedRoles={['admin']}><AdminClinicAdd /></ProtectedRoute>} />
      {/* CATCH-ALL/404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// --- App with Router (if not already in main.jsx) ---
function App() {
  return (
    <AppInner />
  );
}

export default App;
