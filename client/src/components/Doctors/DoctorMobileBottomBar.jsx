// components/doctor/DoctorMobileBottomBar.jsx
import { useEffect, useState } from "react";
import { FiBell, FiCalendar, FiGrid, FiUser } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { getDoctorProfile } from "../../service/doctorApiService";

const DoctorMobileBottomBar = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [doctor, setDoctor] = useState(null);
	const [notifications, setNotifications] = useState(3);

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

	const isActive = (path) => location.pathname === path;

	const bottomNavItems = [
		{
			icon: FiGrid,
			label: "Dashboard",
			path: "/doctor/dashboard",
		},
		{
			icon: FiCalendar,
			label: "Appointments",
			path: "/doctor/appointments",
		},
		{
			icon: FiBell,
			label: "Notifications",
			path: "/doctor/notifications",
			hasNotification: notifications > 0,
		},
		{
			icon: FiUser,
			label: "Profile",
			path: "/doctor/profile",
		},
	];

	return (
		<div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
			<div className="flex items-center justify-around py-2">
				{bottomNavItems.map((item) => {
					const Icon = item.icon;
					const active = isActive(item.path);

					return (
						<button
							key={item.path}
							onClick={() => navigate(item.path)}
							className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 transition-all ${
								active ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
							}`}
						>
							<div className="relative">
								<div
									className={`p-2 rounded-lg transition-all ${
										active ? "bg-blue-50" : "hover:bg-gray-50"
									}`}
								>
									<Icon className="text-xl" />
								</div>
								{item.hasNotification && (
									<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
										{notifications}
									</span>
								)}
							</div>
							<span
								className={`text-xs mt-1 font-medium truncate ${
									active ? "text-blue-600" : "text-gray-500"
								}`}
							>
								{item.label}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default DoctorMobileBottomBar;
