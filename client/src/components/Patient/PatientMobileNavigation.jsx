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
  FiBell,
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
    { icon: FiBell, label: 'Notifications', path: '/patient/notifications' },
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
      {/* Rest of the component remains the same */}
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-16">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      {/* Rest of the hamburger menu and other components */}
    </>
  );
};

export default PatientMobileNavigation;
