import { Routes, Route } from 'react-router-dom';
import NotFoundPage from '../components/ui/NotFoundPage';
import Navbar from '../components/quicklab/Navbar';
export default function QuickLabRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
