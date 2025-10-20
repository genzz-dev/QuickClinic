import { Route, Routes } from 'react-router-dom';
import PatientDesktopNavbar from '../components/Patient/PatientDesktopNavbar';
import PatientMobileNavigation from '../components/Patient/PatientMobileNavigation';
import SearchResultsPage from '../components/public/SearchResultsPage';
import NotFoundPage from '../components/ui/NotFoundPage';
import AppointmentDetails from '../pages/patient/AppointmentDetails';
import BookAppointment from '../pages/patient/BookAppointment';
import PatientAppointments from '../pages/patient/PatientAppointments';
import PatientHealthPage from '../pages/patient/PatientCompleteProfile';
import PatientDashboard from '../pages/patient/PatientDashboard';
import PatientProfilePage from '../pages/patient/PatientProfilePage';
import ClinicDetailPage from '../pages/public/ClinicDetailPage';
import DoctorDetailsPage from '../pages/public/DoctorDetailsPage';
import Doctors from '../pages/public/Doctors';
import NearbyClinicsPage from '../pages/public/Nearbyclinics';
import PatientPreventGuard from './guards/PatientPreventGuard';
import PatientSetupGuard from './guards/PatientSetupGuard';
import ProtectedRoute from './guards/protectedRoutes';
export default function PatientRoutes() {
  return (
    <>
      {/* Patient Dashboard - Requires patient profile */}
      <Routes>
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute role="patient">
              <PatientSetupGuard requireProfile={true}>
                <PatientDesktopNavbar />
                <PatientDashboard />
                <PatientMobileNavigation />
              </PatientSetupGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/nearby"
          element={
            <ProtectedRoute role="patient">
              <PatientSetupGuard requireProfile={true}>
                <PatientDesktopNavbar />
                <NearbyClinicsPage />
                <PatientMobileNavigation />
              </PatientSetupGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointment/:appointmentId"
          element={
            <ProtectedRoute role="patient">
              <PatientSetupGuard requireProfile={true}>
                <PatientDesktopNavbar />
                <AppointmentDetails />
                <PatientMobileNavigation />
              </PatientSetupGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/book-appointment/:doctorId"
          element={
            <ProtectedRoute role="patient">
              <PatientSetupGuard requireProfile={true}>
                <PatientDesktopNavbar />
                <BookAppointment />
                <PatientMobileNavigation />
              </PatientSetupGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <ProtectedRoute role="patient">
              <PatientSetupGuard requireProfile={true}>
                <PatientDesktopNavbar />
                <PatientAppointments />
                <PatientMobileNavigation />
              </PatientSetupGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute role="patient">
              <PatientSetupGuard requireProfile={true}>
                <PatientDesktopNavbar />
                <SearchResultsPage />
                <PatientMobileNavigation />
              </PatientSetupGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/profile"
          element={
            <ProtectedRoute role="patient">
              <PatientSetupGuard requireProfile={true}>
                <PatientDesktopNavbar />
                <PatientProfilePage />
                <PatientMobileNavigation />
              </PatientSetupGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clinic/:clinicId"
          element={
            <ProtectedRoute role="patient">
              <PatientSetupGuard requireProfile={true}>
                <PatientDesktopNavbar />
                <ClinicDetailPage />
                <PatientMobileNavigation />
              </PatientSetupGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/:doctorId"
          element={
            <ProtectedRoute role="patient">
              <PatientSetupGuard requireProfile={true}>
                <PatientDesktopNavbar />
                <DoctorDetailsPage />
                <PatientMobileNavigation />
              </PatientSetupGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/doctors"
          element={
            <ProtectedRoute role="patient">
              <PatientSetupGuard requireProfile={true}>
                <PatientDesktopNavbar />
                <Doctors />
                <PatientMobileNavigation />
              </PatientSetupGuard>
            </ProtectedRoute>
          }
        />
        {/* Complete Profile - Prevent if profile already exists */}
        <Route
          path="/patient/complete-profile"
          element={
            <ProtectedRoute role="patient">
              <PatientPreventGuard preventProfile={true}>
                <PatientHealthPage />
              </PatientPreventGuard>
            </ProtectedRoute>
          }
        />

        {/* Catch all - 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
