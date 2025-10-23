import { useState } from 'react';
import {
  FiCalendar,
  FiHome,
  FiLogOut,
  FiMapPin,
  FiMenu,
  FiSearch,
  FiUser,
  FiUserCheck,
  FiX,
} from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

const PatientMobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const bottomNavItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiMapPin, label: 'Nearby', path: '/patient/nearby' },
    { icon: FiUserCheck, label: 'Doctors', path: '/patient/doctors' },
    { icon: FiCalendar, label: 'Appointments', path: '/patient/appointments' },
    { icon: FiUser, label: 'Profile', path: '/patient/profile' },
  ];

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden">
        <div className="flex items-center justify-around py-2">
          {bottomNavItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-colors ${
                isActivePath(item.path)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slide-out Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMenu}></div>

          {/* Menu Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Menu</span>
                <button
                  onClick={toggleMenu}
                  className="p-1 rounded-md text-gray-600 hover:text-gray-900"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 py-4">
                <div className="space-y-2 px-4">
                  <button
                    onClick={() => {
                      navigate('/patient/settings');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-3 text-left text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FiUser className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/patient/help');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-3 text-left text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FiSearch className="w-5 h-5" />
                    <span className="font-medium">Help & Support</span>
                  </button>

                  {/* Logout Button */}
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-3 text-left text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiLogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientMobileNavigation;
