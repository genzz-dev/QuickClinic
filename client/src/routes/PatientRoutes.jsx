import { Route, Routes } from 'react-router-dom';
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
import PatientNavbar from '../components/Patient/PatientNavbar';
import PatientNotifications from '../pages/patient/PatientNotification';
export default function PatientRoutes() {
  return (
    <>
      <PatientNavbar />
      <div className="pb-20 md:pb-0">
        {/* Patient Dashboard - Requires patient profile */}
        <Routes>
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute role="patient">
                <PatientSetupGuard requireProfile={true}>
                  <PatientDashboard />
                </PatientSetupGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/nearby"
            element={
              <ProtectedRoute role="patient">
                <PatientSetupGuard requireProfile={true}>
                  <NearbyClinicsPage />
                </PatientSetupGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointment/:appointmentId"
            element={
              <ProtectedRoute role="patient">
                <PatientSetupGuard requireProfile={true}>
                  <AppointmentDetails />
                </PatientSetupGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/book-appointment/:doctorId"
            element={
              <ProtectedRoute role="patient">
                <PatientSetupGuard requireProfile={true}>
                  <BookAppointment />
                </PatientSetupGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute role="patient">
                <PatientSetupGuard requireProfile={true}>
                  <PatientAppointments />
                </PatientSetupGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/notifications"
            element={
              <ProtectedRoute role="patient">
                <PatientSetupGuard requireProfile={true}>
                  <PatientNotifications />
                </PatientSetupGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute role="patient">
                <PatientSetupGuard requireProfile={true}>
                  <SearchResultsPage />
                </PatientSetupGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute role="patient">
                <PatientSetupGuard requireProfile={true}>
                  <PatientProfilePage />
                </PatientSetupGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clinic/:clinicId"
            element={
              <ProtectedRoute role="patient">
                <PatientSetupGuard requireProfile={true}>
                  <ClinicDetailPage />
                </PatientSetupGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/:doctorId"
            element={
              <ProtectedRoute role="patient">
                <PatientSetupGuard requireProfile={true}>
                  <DoctorDetailsPage />
                </PatientSetupGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/doctors"
            element={
              <ProtectedRoute role="patient">
                <PatientSetupGuard requireProfile={true}>
                  <Doctors />
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
      </div>
    </>
  );
}
