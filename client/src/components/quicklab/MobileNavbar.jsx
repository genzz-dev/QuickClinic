// MobileNavbar.jsx
import {
  Search,
  Home,
  BookOpen,
  User,
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
import { useState, useEffect, useRef } from 'react';
import { searchLabs } from '../../service/labService';

export default function MobileNavbar({ searchQuery, setSearchQuery }) {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
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
    <>
      {/* Top Bar - Search Only */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="px-4 py-3">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 mb-2 cursor-pointer"
            onClick={() => navigate('/quick-lab')}
          >
            <div className="text-xl font-bold whitespace-nowrap">
              <span className="text-slate-900 dark:text-slate-50">Quick</span>
              <span className="text-yellow-500 dark:text-yellow-400">Labs</span>
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative" ref={searchRef}>
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
            {showSuggestions && (suggestions.labs?.length > 0 || suggestions.tests?.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl max-h-80 overflow-y-auto z-50">
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
                        className="w-full text-left px-3 py-2 hover:bg-yellow-50 dark:hover:bg-slate-800 rounded-lg transition-colors active:scale-95"
                      >
                        <div className="flex items-start gap-3">
                          <Building2 className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                              {lab.name}
                            </p>
                            {lab.address?.city && (
                              <p className="text-xs text-slate-600 dark:text-slate-400">
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
                        className="w-full text-left px-3 py-2 hover:bg-yellow-50 dark:hover:bg-slate-800 rounded-lg transition-colors active:scale-95"
                      >
                        <div className="flex items-start gap-3">
                          <FlaskConical className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                              {test.testName}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
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
          </form>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-black border-t border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="flex items-center justify-around h-16 px-2 relative">
          {/* Home/Labs */}
          <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors active:scale-95">
            <Home className="h-6 w-6" />
            <span className="text-xs font-medium">Home</span>
          </button>

          {/* Labs */}
          <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors active:scale-95">
            <BookOpen className="h-6 w-6" />
            <span className="text-xs font-medium">Labs</span>
          </button>

          {/* Dark Mode Toggle */}
          <div className="flex flex-col items-center justify-center w-full h-full">
            <DarkModeToggle />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Theme
            </span>
          </div>

          {/* Explore toggle for patients & public */}
          {(!isAuthenticated || user?.role === 'patient') && (
            <>
              <button
                onClick={() => setIsExploreOpen((v) => !v)}
                className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors active:scale-95"
              >
                <BookOpen className="h-6 w-6" />
                <span className="text-xs font-medium">Explore</span>
              </button>
              {isExploreOpen && (
                <div className="absolute bottom-16 right-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-2 w-40">
                  <button
                    onClick={() => {
                      setIsExploreOpen(false);
                      navigate('/');
                    }}
                    className="block w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-yellow-50 dark:hover:bg-slate-800"
                  >
                    Quick Clinic
                  </button>
                  <button
                    onClick={() => {
                      setIsExploreOpen(false);
                      navigate('/quick-med');
                    }}
                    className="block w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-yellow-50 dark:hover:bg-slate-800"
                  >
                    Quick Med
                  </button>
                </div>
              )}
            </>
          )}

          {/* Lab Admin: Manage Appointments */}
          {isAuthenticated && user?.role === 'lab_admin' && (
            <button
              onClick={() => navigate('/quick-lab/appointments')}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors active:scale-95"
            >
              <Calendar className="h-6 w-6" />
              <span className="text-xs font-medium">Appts</span>
            </button>
          )}

          {/* Lab Admin: Manage Tests */}
          {isAuthenticated && user?.role === 'lab_admin' && (
            <button
              onClick={() => navigate('/quick-lab/tests')}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors active:scale-95"
            >
              <TestTube className="h-6 w-6" />
              <span className="text-xs font-medium">Tests</span>
            </button>
          )}

          {/* Lab Admin: Manage Staff */}
          {isAuthenticated && user?.role === 'lab_admin' && (
            <button
              onClick={() => navigate('/quick-lab/staff')}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors active:scale-95"
            >
              <Users className="h-6 w-6" />
              <span className="text-xs font-medium">Staff</span>
            </button>
          )}

          {/* Lab Admin: Lab Settings */}
          {isAuthenticated && user?.role === 'lab_admin' && (
            <button
              onClick={() => navigate('/quick-lab/lab-settings')}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors active:scale-95"
            >
              <Settings className="h-6 w-6" />
              <span className="text-xs font-medium">Settings</span>
            </button>
          )}

          {/* Lab Staff: My Appointments */}
          {isAuthenticated && user?.role === 'lab_staff' && (
            <button
              onClick={() => navigate('/quick-lab/staff-appointments')}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors active:scale-95"
            >
              <Calendar className="h-6 w-6" />
              <span className="text-xs font-medium">Appointments</span>
            </button>
          )}

          {/* Patient: Appointments */}
          {isAuthenticated && user?.role === 'patient' && (
            <button
              onClick={() => navigate('/patient/appointments')}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors active:scale-95"
            >
              <Calendar className="h-6 w-6" />
              <span className="text-xs font-medium">Appts</span>
            </button>
          )}

          {/* Conditional: Login/Account OR Logout */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors active:scale-95"
            >
              <LogOut className="h-6 w-6" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors active:scale-95"
            >
              <User className="h-6 w-6" />
              <span className="text-xs font-medium">Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Spacer for fixed navbars */}
      <div className="lg:hidden h-28" />
    </>
  );
}
