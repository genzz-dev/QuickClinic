import { FiLogIn, FiMapPin, FiSearch, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      {/* Bottom Navigation */}
      <div className="flex justify-around py-2 relative">
        <button
          onClick={() => navigate('/nearby')}
          className="flex flex-col items-center text-gray-600 p-2"
        >
          <FiMapPin size={20} />
          <span className="text-xs mt-1">Nearby</span>
        </button>
        <button
          onClick={() => navigate('/doctors')}
          className="flex flex-col items-center text-gray-600 p-2"
        >
          <FiUser size={20} />
          <span className="text-xs mt-1">Doctors</span>
        </button>
        <button
          onClick={() => navigate('/search')}
          className="flex flex-col items-center text-gray-600 p-2"
        >
          <FiSearch size={20} />
          <span className="text-xs mt-1">Search</span>
        </button>
        {/* Explore toggle */}
        <button
          onClick={() => setIsExploreOpen((v) => !v)}
          className="flex flex-col items-center text-gray-600 p-2"
        >
          <span className="text-xs mt-1">Explore</span>
        </button>
        {isExploreOpen && (
          <div className="absolute bottom-16 right-4 bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-40">
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
        <button
          onClick={() => navigate('/login')}
          className="flex flex-col items-center text-gray-600 p-2"
        >
          <FiLogIn size={20} />
          <span className="text-xs mt-1">Register</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNavigation;
