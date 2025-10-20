import { Route, Routes } from 'react-router-dom';
import DoctorMobileBottomBar from '../components/Doctors/DoctorMobileBottomBar';
import DoctorNavbar from '../components/Doctors/DoctorNavbar';
import DoctorRatings from '../components/Doctors/DoctorRatings';
import NotFoundPage from '../components/ui/NotFoundPage';
import AppointmentDetails from '../pages/doctor/AppointmentDetails';
import DoctorAppointments from '../pages/doctor/DoctorAppointment';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorProfilePage from '../pages/doctor/DoctorProfile';
import DoctorCompleteProfile from '../pages/doctor/DoctorProfileComplete';
import DoctorSchedule from '../pages/doctor/DoctorSchedule';
import DoctorShareIdPage from '../pages/doctor/DoctorShareIdPage';
import DoctorPreventGuard from './guards/DoctorPreventGuard';
import DoctorSetupGuard from './guards/DoctorSetupGuard';
import ProtectedRoute from './guards/protectedRoutes';

export default function DoctorRoutes() {
  return (
    <>
      <DoctorNavbar />
      <ProtectedRoute allowedRoles={['doctor']}>
        <Routes>
          {/* Doctor Dashboard - Requires BOTH profile AND clinic */}
          <Route
            path="/"
            element={
              <DoctorSetupGuard requireProfile={true} requireClinic={true}>
                <DoctorDashboard />
              </DoctorSetupGuard>
            }
          />
          <Route
            path="doctor/dashboard"
            element={
              <DoctorSetupGuard requireProfile={true} requireClinic={true}>
                <DoctorDashboard />
              </DoctorSetupGuard>
            }
          />
          <Route
            path="doctor/profile"
            element={
              <DoctorSetupGuard requireProfile={true} requireClinic={true}>
                <DoctorProfilePage />
              </DoctorSetupGuard>
            }
          />
          <Route
            path="doctor/ratings/:doctorId"
            element={
              <DoctorSetupGuard requireProfile={true} requireClinic={true}>
                <DoctorRatings />
              </DoctorSetupGuard>
            }
          />
          <Route
            path="doctor/appointment/:appointmentId"
            element={
              <DoctorSetupGuard requireProfile={true} requireClinic={true}>
                <AppointmentDetails />
              </DoctorSetupGuard>
            }
          />
          <Route
            path="doctor/appointments"
            element={
              <DoctorSetupGuard requireProfile={true} requireClinic={true}>
                <DoctorAppointments />
              </DoctorSetupGuard>
            }
          />
          {/* Share ID Page - Requires profile, prevents if clinic exists */}
          <Route
            path="doctor/share-id"
            element={
              <DoctorSetupGuard requireProfile={true} requireClinic={false}>
                <DoctorPreventGuard preventClinic={true}>
                  <DoctorShareIdPage />
                </DoctorPreventGuard>
              </DoctorSetupGuard>
            }
          />

          {/* Complete Profile - Prevent if profile already exists */}
          <Route
            path="doctor/complete-profile"
            element={
              <DoctorPreventGuard preventProfile={false}>
                <DoctorCompleteProfile />
              </DoctorPreventGuard>
            }
          />
          <Route
            path="doctor/schedule"
            element={
              <DoctorPreventGuard preventProfile={false}>
                <DoctorSchedule />
              </DoctorPreventGuard>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ProtectedRoute>
      <DoctorMobileBottomBar />
    </>
  );
}
