// DesktopNavbar.jsx
import {
  Search,
  LogOut,
  Users,
  Building2,
  FlaskConical,
  Calendar,
  TestTube,
  Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import DarkModeToggle from '../ui/DarkModeToggle';
import DesktopFooter from './DesktopFooter';
import { useState, useEffect, useRef } from 'react';
import { searchLabs } from '../../service/labService';

export default function DesktopNavbar({ searchQuery, setSearchQuery }) {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const debounceTimeout = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await searchLabs({ query: searchQuery.trim(), limit: 5 });
        const labs = response.data || [];

        // Extract unique tests from labs
        const testsMap = new Map();
        labs.forEach((lab) => {
          if (lab.tests) {
            lab.tests.forEach((test) => {
              if (
                test.testName &&
                test.testName.toLowerCase().includes(searchQuery.toLowerCase())
              ) {
                testsMap.set(test.testName, { ...test, labId: lab._id, labName: lab.name });
              }
            });
          }
        });

        const uniqueTests = Array.from(testsMap.values()).slice(0, 5);

        setSuggestions({
          labs: labs.slice(0, 3),
          tests: uniqueTests,
        });
        setShowSuggestions(true);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
        setSuggestions({ labs: [], tests: [] });
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/quick-lab/search?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/quick-lab/search');
    }
  };

  const handleLabClick = (labId) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/quick-lab/lab/${labId}`);
  };

  const handleTestClick = (test) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/quick-lab/lab/${test.labId}`);
  };

  return (
    <nav className="hidden lg:block sticky top-0 z-50 bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/quick-lab')}
          >
            <div className="text-2xl font-bold">
              <span className="text-slate-900 dark:text-slate-50">Quick</span>
              <span className="text-yellow-500 dark:text-yellow-400">Labs</span>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8" ref={searchRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                placeholder="Search labs or tests..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent transition-all"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions &&
                (suggestions.labs?.length > 0 || suggestions.tests?.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50">
                    {/* Labs Section */}
                    {suggestions.labs?.length > 0 && (
                      <div className="p-2">
                        <p className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                          Labs
                        </p>
                        {suggestions.labs.map((lab) => (
                          <button
                            key={lab._id}
                            type="button"
                            onClick={() => handleLabClick(lab._id)}
                            className="w-full text-left px-3 py-2 hover:bg-yellow-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <Building2 className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {lab.name}
                                </p>
                                {lab.address?.city && (
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {lab.address.city}, {lab.address.state}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Tests Section */}
                    {suggestions.tests?.length > 0 && (
                      <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                        <p className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                          Tests
                        </p>
                        {suggestions.tests.map((test, index) => (
                          <button
                            key={`${test.labId}-${index}`}
                            type="button"
                            onClick={() => handleTestClick(test)}
                            className="w-full text-left px-3 py-2 hover:bg-yellow-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <FlaskConical className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {test.testName}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  at {test.labName} • ₹{test.price}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                      <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                        Searching...
                      </div>
                    )}
                  </div>
                )}
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Lab Admin: Manage Appointments */}
            {isAuthenticated && user?.role === 'lab_admin' && (
              <button
                onClick={() => navigate('/quick-lab/appointments')}
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors"
                title="Manage Appointments"
              >
                <Calendar className="h-5 w-5" />
                Appointments
              </button>
            )}

            {/* Lab Admin: Manage Staff shortcut */}
            {isAuthenticated && user?.role === 'lab_admin' && (
              <button
                onClick={() => navigate('/quick-lab/staff')}
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors"
                title="Manage Staff"
              >
                <Users className="h-5 w-5" />
                Staff
              </button>
            )}

            {/* Lab Admin: Manage Tests */}
            {isAuthenticated && user?.role === 'lab_admin' && (
              <button
                onClick={() => navigate('/quick-lab/tests')}
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors"
                title="Manage Tests"
              >
                <TestTube className="h-5 w-5" />
                Tests
              </button>
            )}

            {/* Lab Admin: Lab Settings */}
            {isAuthenticated && user?.role === 'lab_admin' && (
              <button
                onClick={() => navigate('/quick-lab/lab-settings')}
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors"
                title="Lab Settings"
              >
                <Settings className="h-5 w-5" />
                Settings
              </button>
            )}

            {/* Lab Staff: My Appointments */}
            {isAuthenticated && user?.role === 'lab_staff' && (
              <button
                onClick={() => navigate('/quick-lab/staff-appointments')}
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors"
                title="My Appointments"
              >
                <Calendar className="h-5 w-5" />
                My Appointments
              </button>
            )}

            {/* Patient: Appointments (doctor & lab) */}
            {isAuthenticated && user?.role === 'patient' && (
              <button
                onClick={() => navigate('/patient/appointments')}
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors"
                title="My Appointments"
              >
                <Calendar className="h-5 w-5" />
                My Appointments
              </button>
            )}

            {/* Conditional: Login/Register OR Logout */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-yellow-600 dark:hover:text-yellow-400 font-medium transition-colors"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
