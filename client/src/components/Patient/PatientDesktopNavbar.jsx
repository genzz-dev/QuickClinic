import React from "react";
import { FiMapPin, FiUser, FiLogOut, FiCalendar, FiUserCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAuth } from "../../context/authContext";

const PatientDesktopNavbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">QC</span>
            </div>
            <span className="text-xl font-bold text-gray-900">QuickClinic</span>
          </div>

          {/* Search Bar - Wrapped in relative container */}
          <div className="flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate("/patient/nearby")}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
            >
              <FiMapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Nearby</span>
            </button>

            <button
              onClick={() => navigate("/patient/doctors")}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
            >
              <FiUserCheck className="w-4 h-4" />
              <span className="text-sm font-medium">Doctors</span>
            </button>

            <button
              onClick={() => navigate("/patient/appointments")}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
            >
              <FiCalendar className="w-4 h-4" />
              <span className="text-sm font-medium">Appointments</span>
            </button>

            <button
              onClick={() => navigate("/patient/profile")}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
            >
              <FiUser className="w-4 h-4" />
              <span className="text-sm font-medium">Profile</span>
            </button>

            <div className="h-6 w-px bg-gray-300"></div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-md hover:bg-red-50"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PatientDesktopNavbar;
