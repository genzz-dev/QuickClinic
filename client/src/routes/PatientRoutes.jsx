import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './guards/protectedRoutes';
import PatientDashboard from '../pages/patient/PatientDashboard';
import PatientSetupGuard from './guards/PatientSetupGuard';
import PatientPreventGuard from './guards/PatientPreventGuard';
import PatientHealthPage from '../pages/patient/PatientCompleteProfile';
import NotFoundPage from '../components/ui/NotFoundPage';

export default function PatientRoutes() {
  return (
    <>
      {/* Patient Dashboard - Requires patient profile */}
      < Routes>
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
