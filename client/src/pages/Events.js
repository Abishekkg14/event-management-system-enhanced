import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SimpleLeafletMap from '../components/SimpleLeafletMap';
import LeafletPlacesAutocomplete from '../components/LeafletPlacesAutocomplete';
import { motion } from 'framer-motion';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
  const [eventMarkers, setEventMarkers] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventType: 'conference',
    startDate: '',
    endDate: '',
    location: {
      venue: '',
      address: { street: '', city: '', state: '', country: '', zipCode: '' }
    },
    capacity: '',
    client: '',
    pricing: { regular: { amount: '' } },
    budget: { total: '', currency: 'USD' }
  });

  useEffect(() => {
    fetchEvents();
    fetchClients();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const markers = events.map(event => {
      if (event.location && typeof event.location === 'object' && event.location.coordinates) {
        return {
          position: { lat: event.location.coordinates.lat, lng: event.location.coordinates.lng },
          title: event.name,
          infoWindow: `
            <div>
              <h6>${event.name}</h6>
              <p><strong>Date:</strong> ${event.date}</p>
              <p><strong>Client:</strong> ${event.client}</p>
              <p><strong>Budget:</strong> $${event.budget?.total?.toLocaleString() || 0}</p>
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
        setLoading(false);
        return;
      }

      const response = await fetch(`${API}/api/events`, {
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
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API}/api/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) { alert('Please login first'); return; }

      const response = await fetch(`${API}/api/events`, {
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
        if (errorData.errors) {
          const messages = errorData.errors.map(err => err.msg).join('\\n');
          alert('Validation Error:\\n' + messages);
        } else {
          alert('Error: ' + (errorData.message || 'Unable to add event'));
        }
      }
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Network error adding event. Please try again.');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API}/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setEvents(events.filter(e => e.id !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error deleting event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
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
        address: { street: '', city: '', state: '', country: '', zipCode: '' }
      },
      capacity: '',
      client: '',
      pricing: { regular: { amount: '' } },
      budget: { total: '', currency: 'USD' }
    });
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) { alert('Please login first'); return; }

      const response = await fetch(`${API}/api/events/${eventId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setEvents(events.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error updating status');
      }
    } catch (error) {
      console.error('Error updating event status:', error);
      alert('Network error updating status.');
    }
  };

  const filterEvents = (events) => {
    if (filter === 'all') return events;
    if (filter === 'upcoming') {
      return events.filter(event => new Date(event.startDate) > new Date() && event.status !== 'cancelled' && event.status !== 'completed');
    }
    if (filter === 'cancelled') {
      return events.filter(event => event.status === 'cancelled');
    }
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
        coordinates: { lat: location.lat, lng: location.lng }
      }
    }));
  };

  const handleMapLocationSelect = (location) => {
    setSelectedLocation(location);
    setNewEvent(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: { lat: location.lat, lng: location.lng }
      }
    }));
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <h2 className="fw-bold mb-0">Events</h2>
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-outline-secondary" onClick={() => setShowMapModal(true)}>
              <i className="bi bi-geo-alt me-1"></i> Map View
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <i className="bi bi-plus-lg me-1"></i> Add Event
            </button>
            <select className="form-select bg-white border-subtle" style={{ width: 'auto', minWidth: '150px' }} value={filter} onChange={handleFilterChange}>
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border"></div>
          </div>
        ) : filterEvents(events).length === 0 ? (
          <div className="premium-card">
            <div className="card-body text-center py-5">
              <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: 'var(--text-secondary)' }}></i>
              <p className="text-muted mt-3 mb-0" style={{ fontSize: '1.1rem' }}>No events found. Create your first event to get started!</p>
            </div>
          </div>
        ) : (
          <div className="premium-card overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Client</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {filterEvents(events).map((event, i) => (
                    <motion.tr
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <td className="fw-semibold text-dark">
                        {event.title || event.name}
                        {new Date(event.startDate) > new Date() && event.status !== 'cancelled' && event.status !== 'completed' && (
                          <span className="badge bg-warning bg-opacity-25 text-warning ms-2" style={{ fontSize: '0.65rem', verticalAlign: 'middle' }}>
                            <i className="bi bi-clock me-1"></i>
                            {(() => {
                              const days = Math.ceil((new Date(event.startDate) - new Date()) / (1000 * 60 * 60 * 24));
                              return days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`;
                            })()}
                          </span>
                        )}
                      </td>
                      <td className="text-secondary">{event.date ? new Date(event.date).toLocaleDateString() : '-'}</td>
                      <td className="text-secondary">{typeof event.location === 'string' ? event.location : (event.location?.venue || '-')}</td>
                      <td className="text-secondary">{event.client || '-'}</td>
                      <td className="fw-medium">${(typeof event.budget === 'object' ? (event.budget?.total || 0) : Number(event.budget || 0)).toLocaleString()}</td>
                      <td>
                        <select
                          className={`form-select form-select-sm border-0 fw-semibold`}
                          value={event.status || 'draft'}
                          onChange={(e) => handleStatusChange(event.id, e.target.value)}
                          style={{
                            width: 'auto',
                            minWidth: '120px',
                            backgroundColor: event.status === 'completed' ? '#d1fae5' : event.status === 'published' ? '#dbeafe' : event.status === 'cancelled' ? '#fee2e2' : '#f3f4f6',
                            color: event.status === 'completed' ? '#065f46' : event.status === 'published' ? '#1e40af' : event.status === 'cancelled' ? '#991b1b' : '#374151',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-end">
                          <Link to={`/events/${event.id}`} className="btn btn-sm btn-outline-primary" title="View Details">
                            <i className="bi bi-eye"></i>
                          </Link>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteEvent(event.id)} title="Delete Event">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 30, 58, 0.4)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-light border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold text-dark">Add New Event</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddEvent}>
                <div className="modal-body px-4 py-4">
                  <div className="row g-4 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium text-secondary">Event Title *</label>
                      <input type="text" className="form-control bg-white" value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium text-secondary">Event Type *</label>
                      <select className="form-select bg-white" value={newEvent.eventType}
                        onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })} required>
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

                  <div className="row mb-3">
                    <div className="col-12">
                      <label className="form-label fw-medium text-secondary">Description *</label>
                      <textarea className="form-control" rows="2" value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} required></textarea>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Start Date *</label>
                      <input type="datetime-local" className="form-control" value={newEvent.startDate}
                        onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">End Date *</label>
                      <input type="datetime-local" className="form-control" value={newEvent.endDate}
                        onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })} required />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Venue *</label>
                      <LeafletPlacesAutocomplete
                        placeholder="Search for a venue..."
                        onLocationSelect={handleLocationSelect}
                        value={newEvent.location.venue}
                        onChange={(value) => setNewEvent({
                          ...newEvent,
                          location: { ...newEvent.location, venue: value }
                        })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Capacity *</label>
                      <input type="number" className="form-control" min="1" value={newEvent.capacity}
                        onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })} required />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">City</label>
                      <input type="text" className="form-control" value={newEvent.location.address.city}
                        onChange={(e) => setNewEvent({
                          ...newEvent,
                          location: {
                            ...newEvent.location,
                            address: { ...newEvent.location.address, city: e.target.value }
                          }
                        })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Client *</label>
                      <select className="form-select" value={newEvent.client}
                        onChange={(e) => setNewEvent({ ...newEvent, client: e.target.value })} required>
                        <option value="">Select Client</option>
                        {clients.map(client => (
                          <option key={client._id} value={client._id}>{client.companyName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Budget ($)</label>
                      <input type="number" className="form-control" min="0" value={newEvent.budget.total}
                        onChange={(e) => setNewEvent({
                          ...newEvent,
                          budget: { ...newEvent.budget, total: e.target.value }
                        })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Ticket Price ($)</label>
                      <input type="number" className="form-control" min="0" value={newEvent.pricing.regular.amount}
                        onChange={(e) => setNewEvent({
                          ...newEvent,
                          pricing: {
                            ...newEvent.pricing,
                            regular: { ...newEvent.pricing.regular, amount: e.target.value }
                          }
                        })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light px-4 py-3 border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Add Event</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showMapModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 30, 58, 0.4)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-light border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold text-dark">Events Map View</h5>
                <button type="button" className="btn-close" onClick={() => setShowMapModal(false)}></button>
              </div>
              <div className="modal-body p-0">
                <SimpleLeafletMap center={mapCenter} zoom={10} markers={eventMarkers} height="500px" />
              </div>
              <div className="modal-footer bg-light px-4 py-3 border-top">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowMapModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;