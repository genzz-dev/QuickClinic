function getDashboardByRole(role) {
	switch (role) {
		case "patient":
			return "/patient/dashboard";
		case "doctor":
			return "/doctor/dashboard";
		case "admin":
			return "/admin/dashboard";
		default:
			return "/login";
	}
}
