import React from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './guards/protectedRoutes';
import AdminSetupGuard from './guards/AdminSetupGuard';
import AdminPreventGuard from './guards/AdminPreventGuard';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProfileComplete from '../pages/admin/AdminProfileComplete';
import AdminClinicAdd from '../pages/admin/AdminClinicAdd';

export default function AdminRoutes() {
  return (
    <Routes>
      {/* Admin Dashboard - Requires BOTH profile AND clinic */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSetupGuard requireProfile={true} requireClinic={true}>
              <AdminDashboard />
            </AdminSetupGuard>
          </ProtectedRoute>
        }
      />

      {/* Complete Profile - Prevent if profile already exists */}
      <Route
        path="/admin/complete-profile"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPreventGuard preventProfile={true}>
              <AdminProfileComplete />
            </AdminPreventGuard>
          </ProtectedRoute>
        }
      />

      {/* Add Clinic - Requires profile, prevent if clinic exists */}
      <Route
        path="/admin/add-clinic"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSetupGuard requireProfile={true} requireClinic={false}>
              <AdminPreventGuard preventClinic={true}>
                <AdminClinicAdd />
              </AdminPreventGuard>
            </AdminSetupGuard>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
