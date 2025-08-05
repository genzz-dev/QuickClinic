import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

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

// import PatientDashboard from './pages/patient/PatientDashboard';
// import DoctorDashboard from './pages/doctor/DoctorDashboard';
// import AdminDashboard from './pages/admin/AdminDashboard';

import { AuthProvider } from './context/authContext'
import ProtectedRoute from './routes/protectedRoutes';

// --- Layouts ---
const MainLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <MobileBottomBar />
  </>
);

const AuthLayout = () => (
  <>
    {/* No Navbar or BottomBar */}
    <Outlet />
  </>
);

// --- App ---
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* AUTH ROUTES - No Navbars */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* MAIN APP ROUTES - Navbars visible */}
          <Route element={<MainLayout />}>
            {/* Public routes */}
            <Route path="/" element={<QuickClinicHomepage />} />
            <Route path="/clinics" element={<Nearbyclinics />} />
            <Route path="/clinic/:id" element={<ClinicDetailPage />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctor/:id" element={<DoctorDetailsPage />} />
            <Route path="/search" element={<SearchResultsPage />} />

            {/* Patient Dashboard - Protected */}
            <Route
              path="/patient-dashboard"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  {/* <PatientDashboard /> */}
                </ProtectedRoute>
              }
            />
            {/* Doctor Dashboard - Protected */}
            <Route
              path="/doctor-dashboard"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  {/* <DoctorDashboard /> */}
                </ProtectedRoute>
              }
            />
            {/* Admin Dashboard - Protected */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  {/* <AdminDashboard /> */}
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback route: 404 or redirect can go here */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
