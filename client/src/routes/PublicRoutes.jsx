import { Route, Routes } from "react-router-dom";

import Navbar from "../components/public/DesktopNavbar";
import MobileBottomBar from "../components/public/MobileBottomBar";
import SearchResultsPage from "../components/public/SearchResultsPage";
import NotFoundPage from "../components/ui/NotFoundPage";
import ClinicDetailPage from "../pages/public/ClinicDetailPage";
import DoctorDetailsPage from "../pages/public/DoctorDetailsPage";
import Doctors from "../pages/public/Doctors";
import QuickClinicHomepage from "../pages/public/HomePage";
import Nearbyclinics from "../pages/public/Nearbyclinics";
export default function PublicRoutes() {
	return (
		<>
			<Navbar />
			<Routes>
				<Route path="*" element={<NotFoundPage />} />
				<Route path="/" element={<QuickClinicHomepage />} />
				<Route path="/nearby" element={<Nearbyclinics />} />
				<Route path="/search" element={<SearchResultsPage />} />
				<Route path="/clinic/:clinicId" element={<ClinicDetailPage />} />
				<Route path="/doctor/:doctorId" element={<DoctorDetailsPage />} />
				<Route path="/doctors" element={<Doctors />} />
			</Routes>
			<MobileBottomBar />
		</>
	);
}
