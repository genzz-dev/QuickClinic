import { Building, Search, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSearchSuggestions } from '../../service/publicapi';
import Loading from '../ui/Loading';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const result = await getSearchSuggestions(query);
          if (result.success) {
            setSuggestions(result.data);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);

    if (suggestion.type === 'doctor') {
      navigate(`/doctor/${suggestion.id}`);
    } else {
      navigate(`/clinic/${suggestion.id}`);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="relative w-full max-w-lg" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search doctors, clinics..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md bg-white text-gray-900 placeholder-gray-500"
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
          />
        </div>
      </form>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 z-[110] max-h-80 overflow-y-auto">
          {isLoading ? (
            <Loading />
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((suggestion) => (
                <div
                  key={`${suggestion.type}-${suggestion.id}`}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center space-x-3">
                    {suggestion.type === 'doctor' ? (
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Building className="w-3 h-3 text-green-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{suggestion.name}</div>
                      <div className="text-xs text-gray-500">
                        {suggestion.type === 'doctor'
                          ? suggestion.specialization
                          : suggestion.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {query.trim() && (
                <div
                  className="p-3 hover:bg-gray-50 cursor-pointer border-t border-gray-200 bg-gray-50"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <Search className="w-3 h-3 text-gray-600" />
                    </div>
                    <div className="text-sm text-gray-700">
                      Search for "<span className="font-medium">{query}</span>"
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="text-sm">No suggestions found</div>
              <div
                className="text-blue-600 text-sm mt-2 cursor-pointer hover:underline"
                onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
              >
                Search for "{query}"
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
