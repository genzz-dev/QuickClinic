// QuickMedPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMedicineSuggestions } from '../../service/medicineApiService';

// Icons component for cleaner code
const Icons = {
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  Sun: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  Moon: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  ),
  Pill: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
      />
    </svg>
  ),
  Shield: () => (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
  Lightning: () => (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
  Database: () => (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
      />
    </svg>
  ),
  Close: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Spinner: () => (
    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  ),
};

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

  const features = [
    {
      icon: <Icons.Lightning />,
      title: 'Instant Search',
      description: 'Get real-time medicine suggestions as you type with our powerful autocomplete.',
    },
    {
      icon: <Icons.Shield />,
      title: 'FDA Verified Data',
      description: 'Access reliable drug information directly from the OpenFDA database.',
    },
    {
      icon: <Icons.Database />,
      title: 'Comprehensive Details',
      description: 'View usage, side effects, ingredients, warnings, and storage information.',
    },
  ];

  return (
    <div className="min-h-screen bg-med-background text-med-text transition-colors duration-300">
      {/* Hero Section */}
      <main>
        <section className="relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-med-green-50 via-med-background to-med-blue-50 dark:from-med-green-900/20 dark:via-med-background dark:to-med-blue-600/10" />

          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-med-green-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-med-blue-400/20 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
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

              {/* Search Box */}
              <div ref={searchRef} className="relative max-w-2xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-med-green-500 to-med-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300" />
                  <div className="relative flex items-center bg-med-surface border-2 border-med-border rounded-xl overflow-hidden focus-within:border-med-green-500 transition-all duration-200">
                    <div className="pl-5 text-med-text-muted">
                      {isLoading ? <Icons.Spinner /> : <Icons.Search />}
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                        setSelectedIndex(-1);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onKeyDown={handleKeyDown}
                      placeholder="Search for medicines (e.g., Aspirin, Ibuprofen...)"
                      className="w-full px-4 py-4 sm:py-5 bg-transparent text-med-text placeholder-med-text-muted focus:outline-none text-base sm:text-lg"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSuggestions([]);
                        }}
                        className="pr-5 text-med-text-muted hover:text-med-text transition-colors"
                      >
                        <Icons.Close />
                      </button>
                    )}
                  </div>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute w-full mt-2 bg-med-surface border border-med-border rounded-xl shadow-xl overflow-hidden z-50">
                    <ul className="max-h-80 overflow-y-auto">
                      {suggestions.map((suggestion, index) => {
                        const name = suggestion.name || suggestion;
                        return (
                          <li key={index}>
                            <button
                              onClick={() => handleSelectMedicine(name)}
                              className={`w-full px-5 py-3 text-left flex items-center gap-3 transition-colors duration-150 ${
                                index === selectedIndex
                                  ? 'bg-med-green-100 dark:bg-med-green-900/30 text-med-green-700 dark:text-med-green-400'
                                  : 'hover:bg-med-green-50 dark:hover:bg-med-green-900/20'
                              }`}
                            >
                              <Icons.Pill />
                              <span className="font-medium">{name}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* No Results */}
                {showSuggestions &&
                  searchQuery.length >= 2 &&
                  !isLoading &&
                  suggestions.length === 0 && (
                    <div className="absolute w-full mt-2 bg-med-surface border border-med-border rounded-xl shadow-xl p-6 text-center text-med-text-muted">
                      No medicines found for "{searchQuery}"
                    </div>
                  )}
              </div>

              {/* Quick Tags */}
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                <span className="text-sm text-med-text-muted">Popular searches:</span>
                {['Aspirin', 'Ibuprofen', 'Acetaminophen', 'Amoxicillin'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      setShowSuggestions(true);
                    }}
                    className="px-3 py-1 text-sm rounded-full bg-med-surface border border-med-border hover:border-med-green-500 hover:text-med-green-600 transition-all duration-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24 bg-med-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Why Choose QuickMed?</h3>
              <p className="text-med-text-muted max-w-2xl mx-auto">
                Get accurate, comprehensive, and up-to-date medicine information at your fingertips.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-6 lg:p-8 bg-med-background rounded-2xl border border-med-border hover:border-med-green-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-xl bg-gradient-to-br from-med-green-100 to-med-blue-100 dark:from-med-green-900/30 dark:to-med-blue-600/30 text-med-green-600 dark:text-med-green-400 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-semibold mb-3">{feature.title}</h4>
                  <p className="text-med-text-muted leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info Banner */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-med-green-600 to-med-blue-600 p-8 sm:p-12">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <h4 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Part of QuickClinic Ecosystem
                  </h4>
                  <p className="text-white/80 max-w-lg">
                    QuickMed integrates seamlessly with QuickClinic's suite of healthcare tools for
                    a complete medical information experience.
                  </p>
                </div>
                <button
                  className="flex-shrink-0 px-6 py-3 bg-white text-med-green-600 font-semibold rounded-xl hover:bg-med-green-50 transition-colors duration-200 shadow-lg"
                  onClick={navigateToQuickclinic}
                >
                  Explore QuickClinic
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      {/* Footer */}
      <footer className="py-12 bg-med-surface border-t border-med-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Column */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-med-green-500 to-med-green-600 flex items-center justify-center text-white">
                  <Icons.Pill />
                </div>
                <span className="font-bold text-lg">QuickMed</span>
              </div>
              <p className="text-sm text-med-text-muted">Part of the QuickClinic ecosystem</p>
            </div>

            {/* Disclaimer Column */}
            <div className="text-center">
              <h5 className="font-semibold mb-2 text-sm uppercase tracking-wide text-med-text-muted">
                Disclaimer
              </h5>
              <p className="text-sm text-med-text-muted leading-relaxed">
                Data sourced from OpenFDA. For educational purposes only and should not replace
                professional medical advice.
              </p>
            </div>

            {/* CTA Column */}
            <div className="text-center md:text-right">
              <h5 className="font-semibold mb-2 text-sm uppercase tracking-wide text-med-text-muted">
                Need Medical Advice?
              </h5>
              <p className="text-sm text-med-text-muted mb-3">
                Book an appointment with top doctors near you.
              </p>
              <button
                onClick={navigateToQuickclinic}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-med-green-500 to-med-green-600 hover:from-med-green-600 hover:to-med-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <span>Visit QuickClinic</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default QuickMedPage;
