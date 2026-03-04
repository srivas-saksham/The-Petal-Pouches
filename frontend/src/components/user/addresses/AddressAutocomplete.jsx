// frontend/src/components/user/addresses/AddressAutocomplete.jsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, MapPin, Loader } from 'lucide-react';
import geocodingService from '../../services/geocodingService';

const AddressAutocomplete = ({ onSelectAddress, placeholder = "Search address..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);

  const searchAddress = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) { setSuggestions([]); setError(''); return; }
    setLoading(true);
    setError('');
    try {
      const results = await geocodingService.search(searchQuery);
      setSuggestions(results);
      setShowDropdown(true);
    } catch (err) {
      console.error('Address search failed:', err);
      setError('Failed to fetch suggestions. Please try again.');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => { searchAddress(value); }, 500);
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.address);
    setShowDropdown(false);
    setSuggestions([]);
    if (onSelectAddress) {
      onSelectAddress({ address: suggestion.address, lat: suggestion.lat, lng: suggestion.lng, displayName: suggestion.displayName });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-tppdarkwhite/30" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 3 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-tppdarkwhite/10 rounded-lg bg-white dark:bg-tppdark text-tppslate dark:text-tppdarkwhite placeholder-gray-400 dark:placeholder-tppdarkwhite/30 focus:outline-none focus:ring-2 focus:ring-tpppink dark:focus:ring-tppdarkwhite/30 focus:border-transparent transition-colors"
        />
        {loading && <Loader size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tpppink dark:text-tppdarkwhite animate-spin" />}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <MapPin size={14} />{error}
        </p>
      )}

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-tppdarkgray border border-gray-200 dark:border-tppdarkwhite/10 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-tpppink/5 dark:hover:bg-tppdarkwhite/5 border-b border-gray-100 dark:border-tppdarkwhite/10 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-tpppink dark:text-tppdarkwhite mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-tppdarkwhite text-sm">
                    {suggestion.displayName || suggestion.address}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-tppdarkwhite/40 mt-0.5">
                    Lat: {suggestion.lat.toFixed(4)}, Lng: {suggestion.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && query.length >= 3 && suggestions.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-tppdarkgray border border-gray-200 dark:border-tppdarkwhite/10 rounded-lg shadow-lg p-4 text-center z-50">
          <p className="text-gray-500 dark:text-tppdarkwhite/50 text-sm">No results found for "{query}"</p>
        </div>
      )}

      {query.length > 0 && query.length < 3 && (
        <p className="mt-2 text-xs text-gray-500 dark:text-tppdarkwhite/40">Type at least 3 characters to search</p>
      )}
    </div>
  );
};

export default AddressAutocomplete;