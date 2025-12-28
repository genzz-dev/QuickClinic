import { FiCalendar, FiLogOut, FiMapPin, FiUser, FiUserCheck, FiBell } from 'react-icons/fi';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/authContext';

import SearchBar from './SearchBar';
import { useState, useRef, useEffect } from 'react';

const PatientDesktopNavbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3">
            QC
          </div>
          <span className="text-xl font-bold text-gray-800">QuickClinic</span>
        </div>

        {/* Search Bar - Wrapped in relative container */}
        <div className="flex-1 max-w-2xl mx-8">
          <SearchBar />
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/patient/nearby')}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
          >
            <FiMapPin className="w-5 h-5" />
            <span>Nearby</span>
          </button>

          <button
            onClick={() => navigate('/patient/doctors')}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
          >
            <FiUserCheck className="w-5 h-5" />
            <span>Doctors</span>
          </button>

          <button
            onClick={() => navigate('/patient/appointments')}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
          >
            <FiCalendar className="w-5 h-5" />
            <span>Appointments</span>
          </button>

          <button
            onClick={() => navigate('/patient/profile')}
            className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
          >
            <FiUser className="w-5 h-5" />
            <span>Profile</span>
          </button>

          {/* Explore Dropdown */}
          <div className="relative" ref={exploreRef}>
            <button
              onClick={() => setIsExploreOpen((v) => !v)}
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
            >
              <span>Explore</span>
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

          {/* Notification Bell Icon */}
          <button
            onClick={() => navigate('/patient/notifications')}
            className="text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-gray-50"
            aria-label="Notifications"
          >
            <FiBell className="w-5 h-5" />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default PatientDesktopNavbar;
