import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiHome, 
  FiUsers, 
  FiMapPin, 
  FiMenu, 
  FiX, 
  FiLogOut,
  FiUser 
} from "react-icons/fi";
import { useAuth } from '../../context/authContext';

const AdminMobileNavigation = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FiHome className="w-5 h-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>

          <button
            onClick={() => navigate("/admin/manage-doctors")}
            className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FiUsers className="w-5 h-5" />
            <span className="text-xs mt-1">Doctors</span>
          </button>

          <button
            onClick={() => navigate("/admin/add-clinic")}
            className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FiMapPin className="w-5 h-5" />
            <span className="text-xs mt-1">Clinics</span>
          </button>

          <button
            onClick={toggleMenu}
            className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FiMenu className="w-5 h-5" />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-64 h-full shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 rounded-lg mr-3">
                  <FiMapPin className="w-4 h-4" />
                </div>
                <span className="font-bold text-gray-800">Admin Panel</span>
              </div>
              <button
                onClick={toggleMenu}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-gray-100 rounded-full p-2 mr-3">
                  <FiUser className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user?.name || "Admin"}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-4">
              <button
                onClick={() => {
                  navigate("/admin/dashboard");
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
              >
                <FiHome className="w-5 h-5 mr-3" />
                Dashboard
              </button>

              <button
                onClick={() => {
                  navigate("/admin/manage-doctors");
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
              >
                <FiUsers className="w-5 h-5 mr-3" />
                Manage Doctors
              </button>

              <button
                onClick={() => {
                  navigate("/admin/add-clinic");
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
              >
                <FiMapPin className="w-5 h-5 mr-3" />
                Manage Clinics
              </button>
            </div>

            {/* Logout */}
            <div className="absolute bottom-4 left-4 right-4">
              <button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center"
              >
                <FiLogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for bottom navigation */}
      <div className="md:hidden h-16"></div>
    </>
  );
};

export default AdminMobileNavigation;
