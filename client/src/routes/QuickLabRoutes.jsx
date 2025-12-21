import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/quicklab/Navbar';
import QuickLabHomepage from '../pages/quicklab/Homepage';
import LabSearchResults from '../pages/quicklab/LabSearchResults';
import LabDetails from '../pages/quicklab/LabDetails';
import LabAdminProfileComplete from '../pages/quicklab/LabAdminProfileComplete';
import LabAdminAddLab from '../pages/quicklab/LabAdminAddLab';
import LabAdminDashboard from '../pages/quicklab/LabAdminDashboard';
import LabAdminManageStaff from '../pages/quicklab/LabAdminManageStaff';
import LabAdminAppointments from '../pages/quicklab/LabAdminAppointments';
import LabAdminManageTests from '../pages/quicklab/LabAdminManageTests';
import LabStaffProfileComplete from '../pages/quicklab/LabStaffProfileComplete';
import LabStaffWaitingForAssignment from '../pages/quicklab/LabStaffWaitingForAssignment';
import LabStaffDashboard from '../pages/quicklab/LabStaffDashboard';
import LabAdminPreventGuard from './guards/LabAdminPreventGuard';
import LabAdminSetupGuard from './guards/LabAdminSetupGuard';
import LabStaffPreventGuard from './guards/LabStaffPreventGuard';
import LabStaffSetupGuard from './guards/LabStaffSetupGuard';
import ProtectedRoute from './guards/protectedRoutes';

export default function QuickLabRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* ============ LAB ADMIN ROUTES ============ */}

        {/* Lab Admin Profile Completion */}
        <Route
          path="/quick-lab/complete-profile"
          element={
            <ProtectedRoute allowedRoles={['lab_admin']}>
              <LabAdminPreventGuard preventProfile={true}>
                <LabAdminProfileComplete />
              </LabAdminPreventGuard>
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

        {/* Lab Admin Dashboard - Requires profile AND lab */}
        <Route
          path="/quick-lab/dashboard"
          element={
            <ProtectedRoute allowedRoles={['lab_admin']}>
              <LabAdminSetupGuard requireProfile={true} requireLab={true}>
                <LabAdminDashboard />
              </LabAdminSetupGuard>
            </ProtectedRoute>
          }
        />

        {/* Lab Admin - Manage Staff */}
        <Route
          path="/quick-lab/staff"
          element={
            <ProtectedRoute allowedRoles={['lab_admin']}>
              <LabAdminSetupGuard requireProfile={true} requireLab={true}>
                <LabAdminManageStaff />
              </LabAdminSetupGuard>
            </ProtectedRoute>
          }
        />

        {/* Lab Admin - Appointments Management */}
        <Route
          path="/quick-lab/appointments"
          element={
            <ProtectedRoute allowedRoles={['lab_admin']}>
              <LabAdminSetupGuard requireProfile={true} requireLab={true}>
                <LabAdminAppointments />
              </LabAdminSetupGuard>
            </ProtectedRoute>
          }
        />

        {/* Lab Admin - Manage Tests */}
        <Route
          path="/quick-lab/tests"
          element={
            <ProtectedRoute allowedRoles={['lab_admin']}>
              <LabAdminSetupGuard requireProfile={true} requireLab={true}>
                <LabAdminManageTests />
              </LabAdminSetupGuard>
            </ProtectedRoute>
          }
        />

        {/* ============ LAB STAFF ROUTES ============ */}

        {/* Lab Staff Profile Completion */}
        <Route
          path="/quick-lab/staff-profile"
          element={
            <ProtectedRoute allowedRoles={['lab_staff']}>
              <LabStaffPreventGuard preventProfile={true}>
                <LabStaffProfileComplete />
              </LabStaffPreventGuard>
            </ProtectedRoute>
          }
        />

        {/* Lab Staff Waiting for Assignment */}
        <Route
          path="/quick-lab/staff-waiting"
          element={
            <ProtectedRoute allowedRoles={['lab_staff']}>
              <LabStaffSetupGuard requireProfile={true} requireLabAssignment={false}>
                <LabStaffPreventGuard preventWaiting={true}>
                  <LabStaffWaitingForAssignment />
                </LabStaffPreventGuard>
              </LabStaffSetupGuard>
            </ProtectedRoute>
          }
        />

        {/* Lab Staff Dashboard - Requires profile AND lab assignment */}
        <Route
          path="/quick-lab/staff-dashboard"
          element={
            <ProtectedRoute allowedRoles={['lab_staff']}>
              <LabStaffSetupGuard requireProfile={true} requireLabAssignment={true}>
                <LabStaffDashboard />
              </LabStaffSetupGuard>
            </ProtectedRoute>
          }
        />

        {/* ============ PUBLIC ROUTES ============ */}

        {/* Public homepage */}
        <Route path="/quick-lab" element={<QuickLabHomepage />} />

        {/* Lab Search Results */}
        <Route path="/quick-lab/search" element={<LabSearchResults />} />

        {/* Lab Details */}
        <Route path="/quick-lab/lab/:labId" element={<LabDetails />} />
      </Routes>
    </>
  );
}
