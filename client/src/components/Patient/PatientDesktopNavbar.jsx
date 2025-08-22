import React from "react";
import { FiMapPin, FiUser,FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAuth } from "../../context/authContext";
const PatientDesktopNavbar = () => {
  const navigate = useNavigate();
  const {logout}=useAuth();
    const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 hidden md:block">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer z-50" 
            onClick={() => navigate("/")}
          >
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
              onClick={() => navigate("/patient/nearby")}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FiMapPin className="mr-2" />
              <span className="whitespace-nowrap">Nearby Clinics</span>
            </button>
            <button 
              onClick={() => navigate("/patient/doctors")}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FiUser className="mr-2" />
              <span className="whitespace-nowrap">Doctors</span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center shadow-sm"
            >
              <FiLogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PatientDesktopNavbar;