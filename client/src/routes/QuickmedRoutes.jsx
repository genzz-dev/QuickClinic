import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/quickmed/Navbar';
import MedicineDetails from '../pages/quickmed/MedicineDetails';
import NotFoundPage from '../components/ui/NotFoundPage';
export default function QuickmedRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/quick-med/medicine/:medicineName" element={<MedicineDetails />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
