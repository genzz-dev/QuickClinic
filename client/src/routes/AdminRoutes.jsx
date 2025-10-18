import { Route, Routes } from "react-router-dom";
import AdminNavbar from "../components/admin/AdminNavbar";
import NotFoundPage from "../components/ui/NotFoundPage";
import AdminAppointmentDetails from "../pages/admin/AdminAppointmentDetails";
import AdminAppointments from "../pages/admin/AdminAppointments";
import AdminClinicAdd from "../pages/admin/AdminClinicAdd";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProfileComplete from "../pages/admin/AdminProfileComplete";
import AdminRatingsPage from "../pages/admin/AdminRatingsPage";
import ManageDoctors from "../pages/admin/ManageDoctors";
import UpdateClinic from "../pages/admin/UpdateClinic";
import AdminPreventGuard from "./guards/AdminPreventGuard";
import AdminSetupGuard from "./guards/AdminSetupGuard";
import ProtectedRoute from "./guards/protectedRoutes";
export default function AdminRoutes() {
	return (
		<>
			<AdminNavbar />
			<Routes>
				{/* Admin Dashboard - Requires BOTH profile AND clinic */}
				<Route
					path="/admin/dashboard"
					element={
						<ProtectedRoute allowedRoles={["admin"]}>
							<AdminSetupGuard requireProfile={true} requireClinic={true}>
								<AdminDashboard />
							</AdminSetupGuard>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/ratings"
					element={
						<ProtectedRoute allowedRoles={["admin"]}>
							<AdminSetupGuard requireProfile={true} requireClinic={true}>
								<AdminRatingsPage />
							</AdminSetupGuard>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/appointments"
					element={
						<ProtectedRoute allowedRoles={["admin"]}>
							<AdminSetupGuard requireProfile={true} requireClinic={true}>
								<AdminAppointments />
							</AdminSetupGuard>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/appointments/:appointmentId"
					element={
						<ProtectedRoute allowedRoles={["admin"]}>
							<AdminSetupGuard requireProfile={true} requireClinic={true}>
								<AdminAppointmentDetails />
							</AdminSetupGuard>
						</ProtectedRoute>
					}
				/>
				<Route path="*" element={<NotFoundPage />} />
				<Route
					path="/admin/doctors"
					element={
						<ProtectedRoute allowedRoles={["admin"]}>
							<AdminSetupGuard requireProfile={true} requireClinic={true}>
								<ManageDoctors />
							</AdminSetupGuard>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/update-clinic"
					element={
						<ProtectedRoute allowedRoles={["admin"]}>
							<AdminSetupGuard requireProfile={true} requireClinic={true}>
								<UpdateClinic />
							</AdminSetupGuard>
						</ProtectedRoute>
					}
				/>
				{/* Complete Profile - Prevent if profile already exists */}
				<Route
					path="/admin/complete-profile"
					element={
						<ProtectedRoute allowedRoles={["admin"]}>
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
						<ProtectedRoute allowedRoles={["admin"]}>
							<AdminSetupGuard requireProfile={true} requireClinic={false}>
								<AdminPreventGuard preventClinic={true}>
									<AdminClinicAdd />
								</AdminPreventGuard>
							</AdminSetupGuard>
						</ProtectedRoute>
					}
				/>
			</Routes>
		</>
	);
}
