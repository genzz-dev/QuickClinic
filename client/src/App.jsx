import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/public/DesktopNavbar';
import MobileBottomBar from './components/public/MobileBottomBar';
import Nearbyclinics from './pages/public/Nearbyclinics';
import ClinicDetailPage from './pages/public/ClinicDetailPage';
import DoctorDetailsPage from './pages/public/DoctorDetailsPage';
import Doctors from './pages/public/Doctors';
import SearchResultsPage from './components/public/SearchResultsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 pt-0 pb-16 md:pt-8 md:pb-0">
        {/* Top navbar (hidden on mobile) */}
        <Navbar />

        {/* Bottom navigation for mobile */}
        <MobileBottomBar />

        {/* Page content */}
        <Routes>
          <Route path="/nearby" element={<Nearbyclinics />} />
          <Route path="/Clinic/:clinicId" element={<ClinicDetailPage />} />
          <Route path="/doctor/:doctorId" element={<DoctorDetailsPage />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/search" element={<SearchResultsPage />} />

        </Routes>
      </div> 
    </Router>
  );
}

export default App;
