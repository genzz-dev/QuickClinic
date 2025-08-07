import React, { useEffect } from 'react';
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
              <LoginPage />
            </AnonymousRoute>
          </AuthLayout>
        }
      />
      <Route
        path="/register"
        element={
          <AuthLayout>
            <AnonymousRoute>
              <RegisterPage />
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
        path="/clinic/:id"
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
