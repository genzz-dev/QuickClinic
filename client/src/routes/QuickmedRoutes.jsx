import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/quickmed/Navbar';
import MedicineDetails from '../pages/quickmed/MedicineDetails';
import NotFoundPage from '../components/ui/NotFoundPage';
import HomePage from '../pages/quickmed/HomePage';
export default function QuickmedRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/quick-med/medicine/:medicineName" element={<MedicineDetails />} />
        <Route path="/quick-med/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
