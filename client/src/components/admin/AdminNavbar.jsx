import React from "react";
import AdminDesktopNavbar from "./AdminDesktopNavbar";
import AdminMobileNavigation from "./AdminMobileNavigation";

const AdminNavbar = () => {
	return (
		<>
			{/* Desktop Navbar - Hidden on mobile */}
			<div className="hidden md:block">
				<AdminDesktopNavbar />
			</div>

			{/* Mobile Navigation - Hidden on desktop */}
			<div className="md:hidden">
				<AdminMobileNavigation />
			</div>
		</>
	);
};

export default AdminNavbar;
