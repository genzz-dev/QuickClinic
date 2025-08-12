import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
import AdminProfileComplete from './pages/admin/AdminProfileComplete';
import AdminClinicAdd from './pages/admin/AdminClinicAdd';

import { useAuth } from './context/authContext';
import ProtectedRoute from './routes/protectedRoutes';
import AnonymousRoute from './routes/AnonymousRoute';
import getDashboardPath from './utility/getDashboardPath';
import AdminSetupGuard from './routes/AdminSetupGuard';
import AdminPreventGuard from './routes/AdminPreventGuard';

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
  const [loginError, setLoginError] = useState('');

  // Redirect from "/" to the role-based dashboard (after auth is loaded)
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (location.pathname === "/") {
        navigate(getDashboardPath(user.role), { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, location.pathname, navigate]);

  return (
    <>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
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
                <RegisterPage error={registerError} setError={setRegisterError} />
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

        {/* ADMIN ROUTES WITH GUARDS */}
        
        {/* Admin Dashboard - Requires BOTH profile AND clinic */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSetupGuard requireProfile={true} requireClinic={true}>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </AdminSetupGuard>
            </ProtectedRoute>
          }
        />

        {/* Complete Profile - Prevent if profile already exists */}
        <Route 
          path="/admin/complete-profile"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPreventGuard preventProfile={true}>
                <MainLayout>
                  <AdminProfileComplete />
                </MainLayout>
              </AdminPreventGuard>
            </ProtectedRoute>
          }
        />

        {/* Add Clinic - Requires profile, prevent if clinic exists */}
        <Route 
          path="/admin/add-clinic" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSetupGuard requireProfile={true} requireClinic={false}>
                <AdminPreventGuard preventClinic={true}>
                  <MainLayout>
                    <AdminClinicAdd />
                  </MainLayout>
                </AdminPreventGuard>
              </AdminSetupGuard>
            </ProtectedRoute>
          } 
        />

        {/* CATCH-ALL/404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// --- App with Router ---
function App() {
  return (
      <AppInner />
  );
}

export default App;
