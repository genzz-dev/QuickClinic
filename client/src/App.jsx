import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/public/DesktopNavbar';
import MobileBottomBar from './components/public/MobileBottomBar';
import Nearbyclinics from './pages/public/Nearbyclinics';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Navbar/>
          <MobileBottomBar/>
          <Routes>
          <Route path='/nearby' element={<Nearbyclinics/>}/>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;