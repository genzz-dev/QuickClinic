import { FiLogIn, FiMapPin, FiSearch, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const MobileNavigation = () => {
  const navigate = useNavigate();
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      {/* Bottom Navigation */}
      <div className="flex justify-around py-2">
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
