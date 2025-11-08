import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DataViewer = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState({
    overview: null,
    users: [],
    clients: [],
    vendors: [],
    events: [],
    payments: []
  });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoints = [
        '/api/data/overview',
        '/api/data/users',
        '/api/data/clients',
        '/api/data/vendors', 
        '/api/data/events',
        '/api/data/payments'
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint => 
          axios.get(`http://localhost:5000${endpoint}`)
        )
      );

      setData({
        overview: responses[0].data,
        users: responses[1].data.data,
        clients: responses[2].data.data,
        vendors: responses[3].data.data,
        events: responses[4].data.data,
        payments: responses[5].data.data
      });
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'danger',
      pending: 'warning',
      completed: 'success',
      cancelled: 'danger',
      published: 'success',
      draft: 'secondary',
      admin: 'danger',
      manager: 'warning',
      staff: 'primary',
      client: 'info'
    };
    return colors[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex justify-content-between align-items-center">
        <span>{error}</span>
        <button className="btn btn-outline-danger btn-sm" onClick={fetchAllData}>
          <i className="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <h1 className="text-center text-primary mb-4">
        🔍 Database Data Viewer
      </h1>
      
      {/* Overview Stats */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>📊 Database Overview</h2>
          <button className="btn btn-outline-primary" onClick={fetchAllData}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-md-2">
            <div className="card bg-primary text-white">
              <div className="card-body text-center">
                <h3 className="card-title">{data.overview?.stats?.users || 0}</h3>
                <p className="card-text">👥 Users</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-2">
            <div className="card bg-danger text-white">
              <div className="card-body text-center">
                <h3 className="card-title">{data.overview?.stats?.clients || 0}</h3>
                <p className="card-text">🏢 Clients</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-2">
            <div className="card bg-success text-white">
              <div className="card-body text-center">
                <h3 className="card-title">{data.overview?.stats?.vendors || 0}</h3>
                <p className="card-text">🛠️ Vendors</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-2">
            <div className="card bg-warning text-white">
              <div className="card-body text-center">
                <h3 className="card-title">{data.overview?.stats?.events || 0}</h3>
                <p className="card-text">🎪 Events</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-2">
            <div className="card bg-info text-white">
              <div className="card-body text-center">
                <h3 className="card-title">{data.overview?.stats?.payments || 0}</h3>
                <p className="card-text">💰 Payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for different data types */}
      <ul className="nav nav-tabs mb-3" id="dataTabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 0 ? 'active' : ''}`}
            onClick={() => handleTabChange(0)}
          >
            👥 Users <span className="badge bg-primary ms-1">{data.users.length}</span>
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 1 ? 'active' : ''}`}
            onClick={() => handleTabChange(1)}
          >
            🏢 Clients <span className="badge bg-danger ms-1">{data.clients.length}</span>
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 2 ? 'active' : ''}`}
            onClick={() => handleTabChange(2)}
          >
            🛠️ Vendors <span className="badge bg-success ms-1">{data.vendors.length}</span>
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 3 ? 'active' : ''}`}
            onClick={() => handleTabChange(3)}
          >
            🎪 Events <span className="badge bg-warning ms-1">{data.events.length}</span>
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 4 ? 'active' : ''}`}
            onClick={() => handleTabChange(4)}
          >
            💰 Payments <span className="badge bg-info ms-1">{data.payments.length}</span>
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Users Tab */}
        {activeTab === 0 && (
          <div>
            <h3>👥 Users ({data.users.length})</h3>
            <div className="row g-3">
              {data.users.map((user) => (
                <div className="col-12 col-sm-6 col-md-4" key={user._id}>
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">{user.firstName} {user.lastName}</h5>
                      <span className={`badge bg-${getStatusColor(user.role)} mb-2`}>
                        {user.role}
                      </span>
                      <p className="card-text">
                        <small className="text-muted">📧 {user.email}</small>
                      </p>
                      {user.phone && (
                        <p className="card-text">
                          <small className="text-muted">📱 {user.phone}</small>
                        </p>
                      )}
                      <hr />
                      <small className="text-muted">
                        Created: {formatDate(user.createdAt)}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 1 && (
          <div>
            <h3>🏢 Clients ({data.clients.length})</h3>
            <div className="row g-3">
              {data.clients.map((client) => (
                <div className="col-12 col-md-6" key={client._id}>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title text-primary">{client.companyName}</h5>
                        <span className={`badge bg-${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                      </div>
                      <p className="card-text">
                        👤 {client.contactPerson?.firstName} {client.contactPerson?.lastName}
                      </p>
                      <p className="card-text">
                        <small className="text-muted">📧 {client.contactPerson?.email}</small>
                      </p>
                      {client.address && (
                        <p className="card-text">
                          <small className="text-muted">📍 {client.address.city}, {client.address.state}</small>
                        </p>
                      )}
                      <div className="mb-2">
                        <span className="badge bg-outline-secondary me-1">{client.industry}</span>
                        <span className="badge bg-outline-secondary">{client.companySize}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">🎪 {client.totalEvents} Events</small>
                        <strong className="text-success">{formatCurrency(client.totalSpent)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 2 && (
          <div>
            <h3>🛠️ Vendors ({data.vendors.length})</h3>
            <div className="row g-3">
              {data.vendors.map((vendor) => (
                <div className="col-12 col-md-6" key={vendor._id}>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title text-primary">{vendor.businessName}</h5>
                        <span className={`badge bg-${getStatusColor(vendor.status)}`}>
                          {vendor.status}
                        </span>
                      </div>
                      <p className="card-text">
                        👤 {vendor.contactPerson?.firstName} {vendor.contactPerson?.lastName}
                      </p>
                      <p className="card-text">
                        <small className="text-muted">📧 {vendor.contactPerson?.email}</small>
                      </p>
                      <div className="mb-2">
                        <small className="text-muted">🛠️ Services:</small><br />
                        {vendor.services?.map((service, index) => (
                          <span key={index} className="badge bg-outline-secondary me-1 mb-1">
                            {service}
                          </span>
                        ))}
                      </div>
                      {vendor.pricing && (
                        <p className="card-text">
                          <small className="text-muted">💰 {formatCurrency(vendor.pricing.hourly)}/hour</small>
                        </p>
                      )}
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">⭐ {vendor.rating?.average}/5</small>
                        <strong className="text-success">{formatCurrency(vendor.totalEarnings)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 3 && (
          <div>
            <h3>🎪 Events ({data.events.length})</h3>
            <div className="row g-3">
              {data.events.map((event) => (
                <div className="col-12" key={event._id}>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title text-primary">{event.title}</h5>
                        <span className={`badge bg-${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <div className="row">
                        <div className="col-md-8">
                          <p className="card-text">{event.description}</p>
                          <span className="badge bg-outline-secondary me-1">{event.eventType}</span>
                          <p className="card-text">
                            <small className="text-muted">📅 {formatDate(event.startDate)} - {formatDate(event.endDate)}</small>
                          </p>
                          <p className="card-text">
                            <small className="text-muted">📍 {event.location?.venue}</small>
                          </p>
                          <p className="card-text">
                            <small className="text-muted">🏢 Client: {event.client?.companyName}</small>
                          </p>
                        </div>
                        <div className="col-md-4 text-end">
                          <h6 className="text-primary">{event.currentRegistrations} / {event.capacity}</h6>
                          <small className="text-muted">Registrations</small>
                          {event.budget && (
                            <div className="mt-2">
                              <h6 className="text-success">{formatCurrency(event.budget.total)}</h6>
                              <small className="text-muted">Total Budget</small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 4 && (
          <div>
            <h3>💰 Payments ({data.payments.length})</h3>
            <div className="row g-3">
              {data.payments.map((payment) => (
                <div className="col-12 col-sm-6 col-md-4" key={payment._id}>
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title text-success">{formatCurrency(payment.amount, payment.currency)}</h5>
                      <p className="card-text">🏢 {payment.client?.companyName}</p>
                      <p className="card-text">
                        <small className="text-muted">🎪 {payment.event?.title}</small>
                      </p>
                      <div className="mb-2">
                        <span className="badge bg-outline-secondary me-1">{payment.paymentType}</span>
                        <span className={`badge bg-${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      <p className="card-text">
                        <small className="text-muted">💳 {payment.paymentMethod}</small>
                      </p>
                      <p className="card-text">
                        <small className="text-muted">📅 {formatDate(payment.paymentDate)}</small>
                      </p>
                      {payment.description && (
                        <p className="card-text">
                          <small className="text-muted">📝 {payment.description}</small>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-4">
        <small className="text-muted">
          Last updated: {formatDate(data.overview?.timestamp)}
        </small>
      </div>
    </div>
  );
};

export default DataViewer;