import React, { useState, useEffect, useRef } from 'react';

const LeafletPlacesAutocomplete = ({ 
  onLocationSelect, 
  placeholder = "Search for a location...",
  className = "",
  value = "",
  onChange = () => {}
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Mock geocoding service (you can replace with a real one like Nominatim)
  const geocodeLocation = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    
    try {
      // Using OpenStreetMap Nominatim API (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      
      const formattedSuggestions = data.map(item => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: item.address || {}
      }));
      
      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error('Geocoding error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      geocodeLocation(inputValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    onChange(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    
    if (onLocationSelect) {
      onLocationSelect({
        lat: suggestion.lat,
        lng: suggestion.lng,
        address: suggestion.display_name,
        details: suggestion.address
      });
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`position-relative ${className}`} ref={suggestionsRef}>
      <div className="input-group">
        <span className="input-group-text">
          {loading ? (
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <i className="bi bi-geo-alt"></i>
          )}
        </span>
        <input
          ref={inputRef}
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="list-group position-absolute w-100" style={{ zIndex: 1000, top: '100%' }}>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="list-group-item list-group-item-action text-start"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="d-flex align-items-start">
                <i className="bi bi-geo-alt me-2 text-muted"></i>
                <div>
                  <div className="fw-bold">{suggestion.display_name.split(',')[0]}</div>
                  <small className="text-muted">
                    {suggestion.display_name.split(',').slice(1).join(',').trim()}
                  </small>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {showSuggestions && suggestions.length === 0 && inputValue.length >= 3 && !loading && (
        <div className="list-group position-absolute w-100" style={{ zIndex: 1000, top: '100%' }}>
          <div className="list-group-item text-muted text-center">
            <i className="bi bi-search me-2"></i>
            No locations found
          </div>
        </div>
      )}
    </div>
  );
};

export default LeafletPlacesAutocomplete;
