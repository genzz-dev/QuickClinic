import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './guards/protectedRoutes';
import PatientDashboard from '../pages/patient/PatientDashboard';
import PatientSetupGuard from './guards/PatientSetupGuard';
import PatientPreventGuard from './guards/PatientPreventGuard';
import PatientHealthPage from '../pages/patient/PatientCompleteProfile';
import NotFoundPage from '../components/ui/NotFoundPage';
import PatientDesktopNavbar from '../components/Patient/PatientDesktopNavbar';
import PatientMobileNavigation from '../components/Patient/PatientMobileNavigation';
import NearbyClinicsPage from '../pages/public/Nearbyclinics';
import Doctors from '../pages/public/Doctors';
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
              <PatientDesktopNavbar/>
              <PatientDashboard />
              <PatientMobileNavigation/>
            </PatientSetupGuard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/patient/nearby" 
        element={
          <ProtectedRoute role="patient">
            <PatientSetupGuard requireProfile={true}>
              <PatientDesktopNavbar/>
              <NearbyClinicsPage/>
              <PatientMobileNavigation/>
            </PatientSetupGuard>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/patient/doctors" 
        element={
          <ProtectedRoute role="patient">
            <PatientSetupGuard requireProfile={true}>
              <PatientDesktopNavbar/>
              <Doctors/>
              <PatientMobileNavigation/>
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
