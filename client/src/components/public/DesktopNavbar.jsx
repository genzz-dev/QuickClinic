import React from "react";
import { FiSearch, FiMapPin, FiUser, FiLogIn } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import MedicalSearch from "../SearchBar";
const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 hidden md:block">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <h1 className="text-2xl font-bold text-blue-600 whitespace-nowrap">
              <span className="text-blue-800">Quick</span>Clinic
            </h1>
          </div>

          {/* Search Form */}
          {/* <form onSubmit={handleSearch} className="flex-1 mx-6 max-w-xl">
            <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
              <FiSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search clinics, doctors..."
                className="bg-transparent border-none outline-none w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form> */}
          <MedicalSearch/>
          {/* Navigation */}
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => navigate("/nearby")}
              className="flex items-center text-gray-700 hover:text-blue-600"
            >
              <FiMapPin className="mr-2" />
              Nearby Clinics
            </button>
            <button 
              onClick={() => navigate("/doctors")}
              className="flex items-center text-gray-700 hover:text-blue-600"
            >
              <FiUser className="mr-2" />
              Doctors
            </button>
            <button 
              onClick={() => navigate("/login")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FiLogIn className="mr-2" />
              Register
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;