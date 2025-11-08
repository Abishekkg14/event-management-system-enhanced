import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SimpleLeafletMap from '../components/SimpleLeafletMap';
import LeafletPlacesAutocomplete from '../components/LeafletPlacesAutocomplete';
import 'bootstrap/dist/css/bootstrap.min.css';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Leaflet format
  const [eventMarkers, setEventMarkers] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventType: 'conference',
    startDate: '',
    endDate: '',
    location: {
      venue: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
      }
    },
    capacity: '',
    client: '',
    pricing: {
      regular: { amount: '' }
    },
    budget: {
      total: '',
      currency: 'USD'
    }
  });

  // Mock event data
  const mockEvents = [
    {
      id: 1, 
      name: 'Tech Conference 2023',
      date: '2023-10-15',
      location: 'Convention Center, New York',
      client: 'TechCorp Inc.',
      status: 'upcoming',
      budget: 45000,
      attendees: 500
    },
    {
      id: 2, 
      name: 'Annual Charity Gala',
      date: '2023-09-20',
      location: 'Grand Hotel, Chicago',
      client: 'Hope Foundation',
      status: 'upcoming',
      budget: 35000,
      attendees: 250
    },
    {
      id: 3, 
      name: 'Product Launch Event',
      date: '2023-08-05',
      location: 'Innovation Hub, San Francisco',
      client: 'NextGen Devices',
      status: 'completed',
      budget: 60000,
      attendees: 300
    },
    {
      id: 4, 
      name: 'Corporate Team Building',
      date: '2023-07-12',
      location: 'Mountain Retreat, Denver',
      client: 'Global Finance Group',
      status: 'completed',
      budget: 25000,
      attendees: 150
    },
    {
      id: 5, 
      name: 'Industry Summit 2023',
      date: '2023-11-30',
      location: 'Business Center, Boston',
      client: 'Industry Alliance',
      status: 'upcoming',
      budget: 75000,
      attendees: 600
    }
  ];

  useEffect(() => {
    fetchEvents();
    fetchClients();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Create markers for events with location data
    const markers = events.map(event => {
      if (event.location && typeof event.location === 'object' && event.location.coordinates) {
        return {
          position: {
            lat: event.location.coordinates.lat,
            lng: event.location.coordinates.lng
          },
          title: event.name,
          infoWindow: `
            <div>
              <h6>${event.name}</h6>
              <p><strong>Date:</strong> ${event.date}</p>
              <p><strong>Client:</strong> ${event.client}</p>
              <p><strong>Budget:</strong> $${event.budget.toLocaleString()}</p>
            </div>
          `
        };
      }
      return null;
    }).filter(Boolean);

    setEventMarkers(markers);
  }, [events]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/events', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedEvents = data.events.map(event => ({
          id: event._id,
          title: event.title,
          description: event.description,
          eventType: event.eventType,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          capacity: event.capacity,
          currentRegistrations: event.currentRegistrations,
          pricing: event.pricing,
          status: event.status,
          organizer: event.organizer,
          client: typeof event.client === 'object' ? event.client.companyName : event.client,
          vendors: event.vendors,
          staff: event.staff,
          budget: event.budget,
          date: event.startDate,
          time: new Date(event.startDate).toLocaleTimeString(),
          attendees: event.currentRegistrations || 0
        }));
        setEvents(formattedEvents);
      } else {
        console.error('Failed to fetch events:', response.statusText);
        // Fallback to mock data
        setEvents(mockEvents);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to mock data
      setEvents(mockEvents);
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/clients', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
      } else {
        // Fallback to mock data
        const mockClients = [
          { _id: '1', companyName: 'TechCorp Inc.' },
          { _id: '2', companyName: 'Hope Foundation' },
          { _id: '3', companyName: 'NextGen Devices' }
        ];
        setClients(mockClients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Fallback to mock data
      const mockClients = [
        { _id: '1', companyName: 'TechCorp Inc.' },
        { _id: '2', companyName: 'Hope Foundation' },
        { _id: '3', companyName: 'NextGen Devices' }
      ];
      setClients(mockClients);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEvent)
      });

      if (response.ok) {
        const data = await response.json();
        const formattedNewEvent = {
          id: data.event._id,
          title: data.event.title,
          description: data.event.description,
          eventType: data.event.eventType,
          startDate: data.event.startDate,
          endDate: data.event.endDate,
          location: data.event.location,
          capacity: data.event.capacity,
          currentRegistrations: data.event.currentRegistrations,
          pricing: data.event.pricing,
          status: data.event.status,
          organizer: data.event.organizer,
          client: typeof data.event.client === 'object' ? data.event.client.companyName : data.event.client,
          vendors: data.event.vendors,
          staff: data.event.staff,
          budget: data.event.budget,
          // For table display
          name: data.event.title,
          date: data.event.startDate ? data.event.startDate.split('T')[0] : '',
          time: new Date(data.event.startDate).toLocaleTimeString(),
          attendees: data.event.currentRegistrations || 0
        };
        setEvents([...events, formattedNewEvent]);
        setShowAddModal(false);
        resetForm();
        alert('Event added successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error adding event');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Error adding event. Please try again.');
    }
  };

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      eventType: 'conference',
      startDate: '',
      endDate: '',
      location: {
        venue: '',
        address: {
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: ''
        }
      },
      capacity: '',
      client: '',
      pricing: {
        regular: { amount: '' }
      },
      budget: {
        total: '',
        currency: 'USD'
      }
    });
  };

  const filterEvents = (events) => {
    if (filter === 'all') return events;
    return events.filter(event => event.status === filter);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setNewEvent(prev => ({
      ...prev,
      location: {
        ...prev.location,
        venue: location.address || location.display_name,
        address: {
          ...prev.location.address,
          street: location.details?.road || '',
          city: location.details?.city || location.details?.town || '',
          state: location.details?.state || '',
          country: location.details?.country || '',
          zipCode: location.details?.postcode || ''
        },
        coordinates: {
          lat: location.lat,
          lng: location.lng
        }
      }
    }));
  };

  const handleMapLocationSelect = (location) => {
    setSelectedLocation(location);
    setNewEvent(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          lat: location.lat,
          lng: location.lng
        }
      }
    }));
  };

  return (
    <div className="container-fluid">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Events</h2>
          <div>
            <button 
              className="btn btn-info me-2"
              onClick={() => setShowMapModal(true)}
            >
              <i className="bi bi-geo-alt"></i> View on Map
            </button>
            <button 
              className="btn btn-success me-2"
              onClick={() => setShowAddModal(true)}
            >
              <i className="bi bi-plus-lg"></i> Add New Event
            </button>
            <select 
              className="form-select d-inline-block" 
              style={{ width: 'auto' }}
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Client</th>
                  <th>Budget</th>
                  <th>Attendees</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filterEvents(events).map((event) => (
                  <tr key={event.id}>
                    <td>{event.name}</td>
                    <td>{event.date}</td>
                    <td>{typeof event.location === 'string' ? event.location : (event.location?.venue || '')}</td>
                    <td>{event.client}</td>
                    <td>${(typeof event.budget === 'number' ? event.budget : Number(event.budget || 0)).toLocaleString()}</td>
                    <td>{event.attendees}</td>
                    <td>
                      <span className={`badge ${event.status === 'upcoming' ? 'bg-warning' : 'bg-success'}`}>
                        {event.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/events/${event.id}`} className="btn btn-sm btn-info me-2">
                        <i className="bi bi-eye"></i> View
                      </Link>
                      <button className="btn btn-sm btn-outline-danger">
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Event</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddEvent}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Event Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Event Type *</label>
                      <select
                        className="form-select"
                        value={newEvent.eventType}
                        onChange={(e) => setNewEvent({...newEvent, eventType: e.target.value})}
                        required
                      >
                        <option value="conference">Conference</option>
                        <option value="seminar">Seminar</option>
                        <option value="workshop">Workshop</option>
                        <option value="meeting">Meeting</option>
                        <option value="exhibition">Exhibition</option>
                        <option value="trade-show">Trade Show</option>
                        <option value="webinar">Webinar</option>
                        <option value="virtual">Virtual</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      required
                    ></textarea>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Start Date *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={newEvent.startDate}
                        onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">End Date *</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={newEvent.endDate}
                        onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Venue *</label>
                      <LeafletPlacesAutocomplete
                        placeholder="Search for a venue..."
                        onLocationSelect={handleLocationSelect}
                        value={newEvent.location.venue}
                        onChange={(value) => setNewEvent({
                          ...newEvent, 
                          location: {...newEvent.location, venue: value}
                        })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Capacity *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={newEvent.capacity}
                        onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newEvent.location.address.city}
                        onChange={(e) => setNewEvent({
                          ...newEvent, 
                          location: {
                            ...newEvent.location,
                            address: {...newEvent.location.address, city: e.target.value}
                          }
                        })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Client *</label>
                      <select
                        className="form-select"
                        value={newEvent.client}
                        onChange={(e) => setNewEvent({...newEvent, client: e.target.value})}
                        required
                      >
                        <option value="">Select Client</option>
                        {clients.map(client => (
                          <option key={client._id} value={client._id}>
                            {client.companyName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Budget ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={newEvent.budget.total}
                        onChange={(e) => setNewEvent({
                          ...newEvent,
                          budget: {...newEvent.budget, total: e.target.value}
                        })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Ticket Price ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={newEvent.pricing.regular.amount}
                        onChange={(e) => setNewEvent({
                          ...newEvent,
                          pricing: {
                            ...newEvent.pricing,
                            regular: {...newEvent.pricing.regular, amount: e.target.value}
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Events Map View</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowMapModal(false)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <SimpleLeafletMap
                  center={mapCenter}
                  zoom={10}
                  markers={eventMarkers}
                  height="500px"
                />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowMapModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
