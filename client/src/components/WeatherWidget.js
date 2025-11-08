import React, { useState, useEffect } from 'react';

const WeatherWidget = ({ location = { lat: 40.7128, lng: -74.0060 }, eventDate }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, [location, eventDate]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      // For demo purposes, we'll use a mock weather service
      // In production, you would use a real weather API like OpenWeatherMap
      // with the Google API key for enhanced location services
      
      const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy', 'Clear'];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      const mockWeather = {
        temperature: Math.floor(Math.random() * 30) + 10, // 10-40°C
        condition: randomCondition,
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        icon: getWeatherIcon(randomCondition)
      };

      // Simulate API delay
      setTimeout(() => {
        setWeather(mockWeather);
        setLoading(false);
      }, 800);

    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Failed to fetch weather data');
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      'Sunny': '☀️',
      'Cloudy': '☁️',
      'Partly Cloudy': '⛅',
      'Rainy': '🌧️',
      'Clear': '🌤️'
    };
    return icons[condition] || '🌤️';
  };

  const getWeatherColor = (condition) => {
    const colors = {
      'Sunny': 'text-warning',
      'Cloudy': 'text-secondary',
      'Partly Cloudy': 'text-info',
      'Rainy': 'text-primary',
      'Clear': 'text-success'
    };
    return colors[condition] || 'text-info';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading weather...</span>
          </div>
          <p className="mt-2 text-muted">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <i className="bi bi-cloud-slash text-muted" style={{ fontSize: '2rem' }}></i>
          <p className="mt-2 text-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="bi bi-cloud-sun me-2"></i>
          Weather Forecast
        </h6>
        <small className="text-muted">
          {eventDate ? new Date(eventDate).toLocaleDateString() : 'Today'}
        </small>
      </div>
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-6">
            <div className="d-flex align-items-center">
              <span className="display-4 me-3">{getWeatherIcon(weather.condition)}</span>
              <div>
                <h3 className="mb-0">{weather.temperature}°C</h3>
                <p className={`mb-0 ${getWeatherColor(weather.condition)}`}>
                  {weather.condition}
                </p>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="row text-center">
              <div className="col-6">
                <small className="text-muted d-block">Humidity</small>
                <strong>{weather.humidity}%</strong>
              </div>
              <div className="col-6">
                <small className="text-muted d-block">Wind</small>
                <strong>{weather.windSpeed} km/h</strong>
              </div>
            </div>
          </div>
        </div>
        
        {eventDate && (
          <div className="mt-3">
            <div className="alert alert-info mb-0">
              <i className="bi bi-info-circle me-2"></i>
              <small>
                Weather forecast for your event date. 
                {weather.condition === 'Rainy' && ' Consider indoor backup plans.'}
                {weather.condition === 'Sunny' && ' Perfect weather for outdoor events!'}
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherWidget;
