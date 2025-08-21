import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './guards/protectedRoutes';
import DoctorSetupGuard from './guards/DoctorSetupGuard';
import DoctorPreventGuard from './guards/DoctorPreventGuard';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorCompleteProfile from '../pages/doctor/DoctorProfileComplete';
import DoctorShareIdPage from '../pages/doctor/DoctorShareIdPage';
import NotFoundPage from '../components/ui/NotFoundPage';
import DoctorAppointments from '../pages/doctor/DoctorAppointment';
import AppointmentDetails from '../pages/doctor/AppointmentDetails';
import DoctorProfilePage from '../pages/doctor/DoctorProfile';
import DoctorNavbar from '../components/Doctors/DoctorNavbar';
import DoctorMobileBottomBar from '../components/Doctors/DoctorMobileBottomBar';
import DoctorSchedule from '../pages/doctor/DoctorSchedule';

export default function DoctorRoutes() {
  return (
    <>
    <DoctorNavbar/>
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
      <DoctorMobileBottomBar/>
    </>
  );
}
