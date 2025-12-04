// client/src/pages/quickmed/HomePage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMedicineSuggestions } from '../../service/medicineApiService';
import Icons from '../../components/quickmed/HomePage/Icons';
import SearchBar from '../../components/quickmed/HomePage/SearchBar';
import HeroSection from '../../components/quickmed/HomePage/HeroSection';
import FeaturesSection from '../../components/quickmed/HomePage/FeaturesSection';
import InfoBanner from '../../components/quickmed/HomePage/InfoBanner';
import Footer from '../../components/quickmed/HomePage/Footer';

const QuickMedPage = () => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('quickmed-theme') === 'dark' ||
        (!localStorage.getItem('quickmed-theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('quickmed-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('quickmed-theme', 'light');
    }
  }, [darkMode]);

  // Debounced search for suggestions
  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await getMedicineSuggestions(query);
      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle medicine selection
  const handleSelectMedicine = (medicineName) => {
    const encodedName = encodeURIComponent(medicineName.toLowerCase().replace(/\s+/g, '-'));
    navigate(`/quick-med/medicine/${encodedName}`);
  };

  const navigateToQuickclinic = () => {
    navigate('/');
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectMedicine(suggestions[selectedIndex].name || suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-med-background text-med-text transition-colors duration-300">
      <main>
        <HeroSection />

        {/* Search Bar Section */}
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-med-green-50 via-med-background to-med-blue-50 dark:from-med-green-900/20 dark:via-med-background dark:to-med-blue-600/10" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-med-green-100 dark:bg-med-green-900/30 text-med-green-700 dark:text-med-green-400 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-med-green-500 animate-pulse" />
                Powered by OpenFDA
              </div>

              {/* Heading */}
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                Find Medicine
                <span className="block bg-gradient-to-r from-med-green-500 to-med-blue-500 bg-clip-text text-transparent">
                  Information Instantly
                </span>
              </h2>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-med-text-muted mb-10 max-w-2xl mx-auto">
                Search for any medicine and get detailed information about usage, side effects,
                ingredients, warnings, and more from verified FDA sources.
              </p>

              {/* Search Bar Component */}
              <SearchBar
                searchRef={searchRef}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isLoading={isLoading}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                suggestions={suggestions}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                handleSelectMedicine={handleSelectMedicine}
                handleKeyDown={handleKeyDown}
              />
            </div>
          </div>
        </section>

        <FeaturesSection />
        <InfoBanner navigateToQuickclinic={navigateToQuickclinic} />
      </main>

      <Footer navigateToQuickclinic={navigateToQuickclinic} />
    </div>
  );
};

export default QuickMedPage;
