import React from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './guards/protectedRoutes';
import PatientDashboard from '../pages/patient/PatientDashboard';

export default function PatientRoutes() {
  return (
    <Routes>
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
