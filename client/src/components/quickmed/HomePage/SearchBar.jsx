// client/src/components/quickmed/HomePage/SearchBar.jsx
import React from 'react';
import Icons from './Icons';

const SearchBar = ({
  searchRef,
  searchQuery,
  setSearchQuery,
  isLoading,
  showSuggestions,
  setShowSuggestions,
  suggestions,
  selectedIndex,
  setSelectedIndex,
  handleSelectMedicine,
  handleKeyDown,
}) => {
  const popularTags = ['Aspirin', 'Ibuprofen', 'Acetaminophen', 'Amoxicillin'];

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    setShowSuggestions(true);
  };

  return (
    <div ref={searchRef} className="relative max-w-2xl mx-auto">
      {/* Search Box */}
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
      {showSuggestions && searchQuery.length >= 2 && !isLoading && suggestions.length === 0 && (
        <div className="absolute w-full mt-2 bg-med-surface border border-med-border rounded-xl shadow-xl p-6 text-center text-med-text-muted">
          No medicines found for "{searchQuery}"
        </div>
      )}

      {/* Quick Tags */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <span className="text-sm text-med-text-muted">Popular searches:</span>
        {popularTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className="px-3 py-1 text-sm rounded-full bg-med-surface border border-med-border hover:border-med-green-500 hover:text-med-green-600 transition-all duration-200"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
