import { FiLogIn, FiMapPin, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import SearchBar from './SearchBar';

const Navbar = () => {
  const navigate = useNavigate();
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const exploreRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target)) {
        setIsExploreOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 hidden md:block">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <div className="flex items-center cursor-pointer z-50" onClick={() => navigate('/')}>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent whitespace-nowrap">
              QuickClinic
            </h1>
          </div>

          {/* Search Bar - Wrapped in relative container */}
          <div className="flex-1 mx-8 max-w-2xl relative z-40">
            <SearchBar />
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-6 z-50">
            <button
              onClick={() => navigate('/nearby')}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FiMapPin className="mr-2" />
              <span className="whitespace-nowrap">Nearby Clinics</span>
            </button>
            <button
              onClick={() => navigate('/doctors')}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FiUser className="mr-2" />
              <span className="whitespace-nowrap">Doctors</span>
            </button>
            {/* Explore Dropdown */}
            <div className="relative" ref={exploreRef}>
              <button
                onClick={() => setIsExploreOpen((v) => !v)}
                className="flex items-center text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
              >
                <span className="whitespace-nowrap">Explore</span>
              </button>
              {isExploreOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                  <button
                    onClick={() => {
                      setIsExploreOpen(false);
                      navigate('/quick-med');
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Quick Med
                  </button>
                  <button
                    onClick={() => {
                      setIsExploreOpen(false);
                      navigate('/quick-lab');
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Quick Lab
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center shadow-sm"
            >
              <FiLogIn className="mr-2" />
              <span className="whitespace-nowrap">Register</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
