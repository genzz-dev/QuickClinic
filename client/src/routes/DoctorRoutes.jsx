import React from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './guards/protectedRoutes';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';

export default function DoctorRoutes() {
  return (
    <Routes>
      <Route path="*" element={<NotFoundPage />} />
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
