import { useState, useEffect, useRef } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { getMedicineSuggestions } from '../../service/medicineApiService';
import DarkModeToggle from '../ui/DarkModeToggle';
import { useNavigate } from 'react-router-dom';
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const exploreRef = useRef(null);
  // Handle search input changes
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length >= 2) {
      setIsLoading(true);
      try {
        const response = await getMedicineSuggestions(value);
        console.log(response);
        setSuggestions(response.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    navigate(`/quick-med/medicine/${suggestion}`);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (exploreRef.current && !exploreRef.current.contains(event.target)) {
        setIsExploreOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-[var(--color-med-background)] border-b border-[var(--color-med-border)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold">
              <span className="text-black dark:text-white">Quick</span>
              <span className="text-[var(--color-med-green-600)]">Med</span>
              <span className="text-xs ml-1 text-[var(--color-med-blue-600)]">by Quick Clinic</span>
            </h1>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[var(--color-med-text-muted)]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search medicines..."
                className="block w-full pl-10 pr-3 py-2 border border-[var(--color-med-border)] rounded-lg 
                         bg-[var(--color-med-surface)] text-[var(--color-med-text)]
                         placeholder-[var(--color-med-text-muted)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-med-green-500)] 
                         focus:border-transparent transition-all"
              />

              {/* Search Suggestions Dropdown */}
              {showSuggestions && (
                <div
                  className="absolute top-full mt-2 w-full bg-[var(--color-med-surface)] border 
                              border-[var(--color-med-border)] rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
                >
                  {isLoading ? (
                    <div className="px-4 py-3 text-[var(--color-med-text-muted)]">Loading...</div>
                  ) : suggestions.length > 0 ? (
                    <ul>
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-4 py-2 hover:bg-[var(--color-med-green-50)] dark:hover:bg-[var(--color-med-green-900)]
                                   cursor-pointer text-[var(--color-med-text)] transition-colors"
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-[var(--color-med-text-muted)]">
                      No suggestions found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Explore Dropdown (patients & public) */}
            {(!isAuthenticated || user?.role === 'patient') && (
              <div className="relative" ref={exploreRef}>
                <button
                  onClick={() => setIsExploreOpen((v) => !v)}
                  className="px-3 py-2 text-[var(--color-med-text)] hover:text-[var(--color-med-green-600)] font-medium"
                >
                  Explore
                </button>
                {isExploreOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-[var(--color-med-surface)] border border-[var(--color-med-border)] rounded-lg shadow-lg py-2">
                    <button
                      onClick={() => {
                        setIsExploreOpen(false);
                        navigate('/');
                      }}
                      className="block w-full text-left px-4 py-2 text-[var(--color-med-text)] hover:bg-[var(--color-med-green-50)] dark:hover:bg-[var(--color-med-green-900)]"
                    >
                      Quick Clinic
                    </button>
                    <button
                      onClick={() => {
                        setIsExploreOpen(false);
                        navigate('/quick-lab');
                      }}
                      className="block w-full text-left px-4 py-2 text-[var(--color-med-text)] hover:bg-[var(--color-med-green-50)] dark:hover:bg-[var(--color-med-green-900)]"
                    >
                      Quick Lab
                    </button>
                  </div>
                )}
              </div>
            )}
            <DarkModeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <DarkModeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md 
                       text-[var(--color-med-text)] hover:bg-[var(--color-med-surface)]
                       focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-med-green-500)]"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[var(--color-med-border)]">
          <div className="px-4 pt-4 pb-3 space-y-3">
            {/* Mobile Search Bar */}
            <div className="relative" ref={searchRef}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[var(--color-med-text-muted)]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search medicines..."
                className="block w-full pl-10 pr-3 py-2 border border-[var(--color-med-border)] rounded-lg 
                         bg-[var(--color-med-surface)] text-[var(--color-med-text)]
                         placeholder-[var(--color-med-text-muted)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-med-green-500)] 
                         focus:border-transparent"
              />

              {/* Mobile Search Suggestions */}
              {showSuggestions && (
                <div
                  className="absolute top-full mt-2 w-full bg-[var(--color-med-surface)] border 
                              border-[var(--color-med-border)] rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
                >
                  {isLoading ? (
                    <div className="px-4 py-3 text-[var(--color-med-text-muted)]">Loading...</div>
                  ) : suggestions.length > 0 ? (
                    <ul>
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-4 py-2 hover:bg-[var(--color-med-green-50)] dark:hover:bg-[var(--color-med-green-900)]
                                   cursor-pointer text-[var(--color-med-text)]"
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-[var(--color-med-text-muted)]">
                      No suggestions found
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Explore quick links */}
            <div className="grid grid-cols-2 gap-3 px-4 pb-4">
              <button
                onClick={() => navigate('/')}
                className="px-3 py-2 rounded-lg border border-[var(--color-med-border)] bg-[var(--color-med-surface)] text-[var(--color-med-text)]"
              >
                Quick Clinic
              </button>
              <button
                onClick={() => navigate('/quick-lab')}
                className="px-3 py-2 rounded-lg border border-[var(--color-med-border)] bg-[var(--color-med-surface)] text-[var(--color-med-text)]"
              >
                Quick Lab
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
