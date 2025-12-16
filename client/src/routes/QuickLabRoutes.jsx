import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/quicklab/Navbar';
import QuickLabHomepage from '../pages/quicklab/Homepage';
import LabAdminProfileComplete from '../pages/quicklab/LabAdminProfileComplete';
import LabAdminAddLab from '../pages/quicklab/LabAdminAddLab';
import LabAdminPreventGuard from './guards/LabAdminPreventGuard';
import LabAdminSetupGuard from './guards/LabAdminSetupGuard';
import ProtectedRoute from './guards/protectedRoutes';

export default function QuickLabRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Complete Profile - Prevent if profile already exists */}
        <Route
          path="/quick-lab/complete-profile"
          element={
            <ProtectedRoute allowedRoles={['lab_admin', 'lab_staff']}>
              <LabAdminPreventGuard preventProfile={true}>
                <LabAdminProfileComplete />
              </LabAdminPreventGuard>
            </ProtectedRoute>
          }
        />

        {/* Lab Admin Dashboard - Requires profile */}
        <Route
          path="/quick-lab/dashboard"
          element={
            <ProtectedRoute allowedRoles={['lab_admin', 'lab_staff']}>
              <LabAdminSetupGuard requireProfile={true} requireLab={true}>
                <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white p-4 md:p-8">
                  <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold text-lab-black-900 mb-2">Lab Dashboard</h1>
                    <p className="text-lab-black-600">Coming soon...</p>
                  </div>
                </div>
              </LabAdminSetupGuard>
            </ProtectedRoute>
          }
        />

        {/* Add Lab - Requires profile, prevent if lab already exists */}
        <Route
          path="/quick-lab/add-lab"
          element={
            <ProtectedRoute allowedRoles={['lab_admin']}>
              <LabAdminSetupGuard requireProfile={true} requireLab={false}>
                <LabAdminPreventGuard preventLab={true}>
                  <LabAdminAddLab />
                </LabAdminPreventGuard>
              </LabAdminSetupGuard>
            </ProtectedRoute>
          }
        />

        {/* Public homepage */}
        <Route path="/" element={<QuickLabHomepage />} />
        <Route path="*" element={<QuickLabHomepage />} />
      </Routes>
    </>
  );
}
