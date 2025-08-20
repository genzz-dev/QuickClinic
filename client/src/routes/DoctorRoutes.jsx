import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './guards/protectedRoutes';
import DoctorSetupGuard from './guards/DoctorSetupGuard';
import DoctorPreventGuard from './guards/DoctorPreventGuard';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorCompleteProfile from '../pages/doctor/DoctorProfileComplete';
import DoctorShareIdPage from '../pages/doctor/DoctorShareIdPage';
import NotFoundPage from '../components/ui/NotFoundPage';

export default function DoctorRoutes() {
  return (
    <>
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

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ProtectedRoute>
    </>
  );
}
