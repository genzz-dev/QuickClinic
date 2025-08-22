import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiMapPin, FiUser, FiLogIn, FiMenu, FiX, FiAtSign, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/authContext";
const PatientMobileNavigation = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };
  
  const {logout}=useAuth();
    const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      {/* Bottom Navigation */}
      <div className="flex justify-around py-2">
        <button 
          onClick={() => navigate("/patient/nearby")}
          className="flex flex-col items-center text-gray-600 p-2"
        >
          <FiMapPin size={20} />
          <span className="text-xs mt-1">Nearby</span>
        </button>
        <button 
          onClick={() => navigate("/patient/doctors")}
          className="flex flex-col items-center text-gray-600 p-2"
        >
          <FiUser size={20} />
          <span className="text-xs mt-1">Doctors</span>
        </button>
         <button 
          onClick={() => navigate("/search")}
          className="flex flex-col items-center text-gray-600 p-2"
        >
          <FiSearch size={20} />
          <span className="text-xs mt-1">Search</span>
        </button>
         <button 
          onClick={handleLogout}
          className="flex flex-col items-center text-gray-600 p-2"
        >
          <FiLogOut size={20} />
          <span className="text-xs mt-1">Logout</span>
        </button>
      </div>

    </div>
  );
};

export default PatientMobileNavigation;