import React from "react";
import { FiHome, FiUsers, FiMapPin, FiLogOut, FiUser, FiClock, FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/authContext'

const AdminDesktopNavbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Assuming you have logout function in auth context

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center cursor-pointer"
          >
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                QuickClinic
              </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <FiHome className="w-4 h-4 mr-2" />
              Dashboard
            </button>

            <button
              onClick={() => navigate("/admin/doctors")}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <FiUsers className="w-4 h-4 mr-2" />
              Manage Doctors
            </button>

            <button
              onClick={() => navigate("/admin/update-clinic")}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <FiMapPin className="w-4 h-4 mr-2" />
              Manage Clinics
            </button>
              <button
              onClick={() => navigate("/admin/appointments")}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <FiClock className="w-4 h-4 mr-2" />
              Manage Appointments
            </button>
            <button
              onClick={() => navigate("/admin/ratings")}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <FiStar className="w-4 h-4 mr-2" />
              Ratings
            </button>
            
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600">
              <FiUser className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                {user?.name || "Admin"}
              </span>
            </div>
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

export default AdminDesktopNavbar;
