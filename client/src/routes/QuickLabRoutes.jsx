import { Routes, Route } from 'react-router-dom';
import NotFoundPage from '../components/ui/NotFoundPage';
import Navbar from '../components/quicklab/Navbar';
import QuickLabHomepage from '../pages/quicklab/Homepage';
export default function QuickLabRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="*" element={<QuickLabHomepage />} />
      </Routes>
    </>
  );
}
