import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
	FiSearch,
	FiMapPin,
	FiUser,
	FiLogOut,
	FiMenu,
	FiX,
	FiCalendar,
	FiUserCheck,
	FiHome,
} from "react-icons/fi";
import { useAuth } from "../../context/authContext";

const PatientMobileNavigation = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const { logout } = useAuth();

	const handleSearch = (e) => {
		e.preventDefault();
		navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
	};

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/login");
		} catch (error) {
			console.error("Logout error:", error);
		}
		setIsMenuOpen(false);
	};

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	const bottomNavItems = [
		{ icon: FiHome, label: "Home", path: "/" },
		{ icon: FiMapPin, label: "Nearby", path: "/patient/nearby" },
		{ icon: FiUserCheck, label: "Doctors", path: "/patient/doctors" },
		{ icon: FiCalendar, label: "Appointments", path: "/patient/appointments" },
		{ icon: FiUser, label: "Profile", path: "/patient/profile" },
	];

	const isActivePath = (path) => {
		if (path === "/") {
			return location.pathname === "/";
		}
		return location.pathname.startsWith(path);
	};

	return (
		<>
			{/* Mobile Top Header */}
			<div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200 md:hidden">
				<div className="flex items-center justify-between px-4 py-3">
					{/* Logo */}
					<div
						onClick={() => navigate("/")}
						className="flex items-center cursor-pointer"
					>
						<div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
							<span className="text-white font-bold text-xs">QC</span>
						</div>
						<span className="text-lg font-bold text-gray-900">QuickClinic</span>
					</div>

					{/* Menu Button */}
					<button
						onClick={toggleMenu}
						className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
					>
						<FiMenu className="w-6 h-6" />
					</button>
				</div>

				{/* Search Bar */}
				<div className="px-4 pb-3">
					<form onSubmit={handleSearch} className="relative">
						<input
							type="text"
							placeholder="Search doctors, clinics, specialties..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
						/>
						<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
					</form>
				</div>
			</div>

			{/* Mobile Bottom Navigation */}
			<div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden">
				<div className="flex items-center justify-around py-2">
					{bottomNavItems.map((item, index) => (
						<button
							key={index}
							onClick={() => navigate(item.path)}
							className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-colors ${
								isActivePath(item.path)
									? "text-blue-600 bg-blue-50"
									: "text-gray-600 hover:text-blue-600"
							}`}
						>
							<item.icon className="w-5 h-5" />
							<span className="text-xs font-medium">{item.label}</span>
						</button>
					))}
				</div>
			</div>

			{/* Slide-out Menu Overlay */}
			{isMenuOpen && (
				<div className="fixed inset-0 z-50 md:hidden">
					<div
						className="fixed inset-0 bg-black bg-opacity-50"
						onClick={toggleMenu}
					></div>

					{/* Menu Panel */}
					<div className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl">
						<div className="flex flex-col h-full">
							{/* Menu Header */}
							<div className="flex items-center justify-between p-4 border-b border-gray-200">
								<span className="text-lg font-semibold text-gray-900">
									Menu
								</span>
								<button
									onClick={toggleMenu}
									className="p-1 rounded-md text-gray-600 hover:text-gray-900"
								>
									<FiX className="w-5 h-5" />
								</button>
							</div>

							{/* Menu Items */}
							<nav className="flex-1 py-4">
								<div className="space-y-2 px-4">
									<button
										onClick={() => {
											navigate("/patient/settings");
											setIsMenuOpen(false);
										}}
										className="w-full flex items-center space-x-3 px-3 py-3 text-left text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
									>
										<FiUser className="w-5 h-5" />
										<span className="font-medium">Settings</span>
									</button>

									<button
										onClick={() => {
											navigate("/patient/help");
											setIsMenuOpen(false);
										}}
										className="w-full flex items-center space-x-3 px-3 py-3 text-left text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
									>
										<FiSearch className="w-5 h-5" />
										<span className="font-medium">Help & Support</span>
									</button>

									{/* Logout Button */}
									<div className="pt-4 mt-4 border-t border-gray-200">
										<button
											onClick={handleLogout}
											className="w-full flex items-center space-x-3 px-3 py-3 text-left text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
										>
											<FiLogOut className="w-5 h-5" />
											<span className="font-medium">Logout</span>
										</button>
									</div>
								</div>
							</nav>
						</div>
					</div>
				</div>
			)}

			{/* Bottom padding for content to avoid bottom nav overlap */}
			<div className="h-20 md:hidden"></div>
		</>
	);
};

export default PatientMobileNavigation;
