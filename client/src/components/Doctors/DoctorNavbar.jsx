// components/doctor/DoctorNavbar.jsx
import { useEffect, useState } from "react";
import {
	FiCalendar,
	FiClock,
	FiGrid,
	FiLogOut,
	FiMenu,
	FiUser,
	FiX,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { getDoctorProfile } from "../../service/doctorApiService";

const DoctorNavbar = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [doctor, setDoctor] = useState(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { logout } = useAuth();
	useEffect(() => {
		loadDoctorProfile();
	}, []);

	const loadDoctorProfile = async () => {
		try {
			const response = await getDoctorProfile();
			setDoctor(response.data);
		} catch (error) {
			console.error("Failed to load doctor profile:", error);
		}
	};

	const handleLogout = async () => {
		console.log("hey");
		await logout();
		navigate("/");
	};

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	const isActive = (path) => location.pathname === path;

	return (
		<>
			<nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo */}
						<div
							onClick={() => navigate("/doctor/dashboard")}
							className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
						>
							<span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
								QuickClinic
							</span>
						</div>

						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center space-x-6">
							<button
								onClick={() => navigate("/doctor/dashboard")}
								className={`flex items-center px-4 py-2 rounded-lg transition-all ${
									isActive("/doctor/dashboard")
										? "text-blue-600 bg-blue-50 shadow-sm"
										: "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
								}`}
							>
								<FiGrid className="mr-2" />
								Dashboard
							</button>

							<button
								onClick={() => navigate("/doctor/appointments")}
								className={`flex items-center px-4 py-2 rounded-lg transition-all ${
									isActive("/doctor/appointments")
										? "text-blue-600 bg-blue-50 shadow-sm"
										: "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
								}`}
							>
								<FiCalendar className="mr-2" />
								Appointments
							</button>

							<button
								onClick={() => navigate("/doctor/profile")}
								className={`flex items-center px-4 py-2 rounded-lg transition-all ${
									isActive("/doctor/profile")
										? "text-blue-600 bg-blue-50 shadow-sm"
										: "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
								}`}
							>
								<FiUser className="mr-2" />
								Profile
							</button>
							<button
								onClick={() => navigate("/doctor/schedule")}
								className={`flex items-center px-4 py-2 rounded-lg transition-all ${
									isActive("/doctor/schedule")
										? "text-blue-600 bg-blue-50 shadow-sm"
										: "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
								}`}
							>
								<FiClock className="mr-2" />
								schedule
							</button>
						</div>

						{/* Right Side - Logout */}
						<div className="hidden md:flex items-center">
							<button
								onClick={handleLogout}
								className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center shadow-sm"
							>
								<FiLogOut className="mr-2" />
								Logout
							</button>
						</div>

						{/* Mobile Menu Button */}
						<button
							onClick={toggleMenu}
							className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all"
						>
							{isMenuOpen ? (
								<FiX className="text-xl" />
							) : (
								<FiMenu className="text-xl" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
						<div className="px-4 py-4 space-y-3">
							<button
								onClick={() => {
									navigate("/doctor/dashboard");
									setIsMenuOpen(false);
								}}
								className={`w-full flex items-center px-3 py-3 rounded-lg transition-all ${
									isActive("/doctor/dashboard")
										? "text-blue-600 bg-blue-50"
										: "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
								}`}
							>
								<FiGrid className="mr-3 text-lg" />
								Dashboard
							</button>

							<button
								onClick={() => {
									navigate("/doctor/appointments");
									setIsMenuOpen(false);
								}}
								className={`w-full flex items-center px-3 py-3 rounded-lg transition-all ${
									isActive("/doctor/appointments")
										? "text-blue-600 bg-blue-50"
										: "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
								}`}
							>
								<FiCalendar className="mr-3 text-lg" />
								Appointments
							</button>

							<button
								onClick={() => {
									navigate("/doctor/profile");
									setIsMenuOpen(false);
								}}
								className={`w-full flex items-center px-3 py-3 rounded-lg transition-all ${
									isActive("/doctor/profile")
										? "text-blue-600 bg-blue-50"
										: "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
								}`}
							>
								<FiUser className="mr-3 text-lg" />
								Profile
							</button>

							<button
								onClick={handleLogout}
								className="w-full flex items-center px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
							>
								<FiLogOut className="mr-3 text-lg" />
								Logout
							</button>
						</div>
					</div>
				)}
			</nav>
		</>
	);
};

export default DoctorNavbar;
