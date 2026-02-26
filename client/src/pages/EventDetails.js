import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const statusBadgeClass = {
  published: 'bg-success',
  draft: 'bg-secondary',
  completed: 'bg-info',
  cancelled: 'bg-danger',
  upcoming: 'bg-warning',
};

const taskStatusBadge = (status) => {
  if (status === 'completed') return 'bg-success';
  if (status === 'in-progress') return 'bg-warning';
  return 'bg-secondary';
};

const taskStatusLabel = (status) => {
  if (status === 'completed') return 'Completed';
  if (status === 'in-progress') return 'In Progress';
  return 'Pending';
};

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          setError('Please login to view event details.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API}/api/events/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const clientObj = typeof data.client === 'object' ? data.client : null;
          const mapped = {
            id: data._id,
            name: data.title,
            description: data.description || '',
            eventType: data.eventType || '',
            date: data.startDate ? new Date(data.startDate).toLocaleDateString() : '',
            endDate: data.endDate ? new Date(data.endDate).toLocaleDateString() : '',
            location: data.location?.venue || '',
            address: data.location?.address
              ? [data.location.address.street, data.location.address.city, data.location.address.state, data.location.address.zipCode, data.location.address.country].filter(Boolean).join(', ')
              : '',
            client: clientObj?.companyName || '',
            clientContact: clientObj?.contactPerson
              ? `${clientObj.contactPerson.firstName} ${clientObj.contactPerson.lastName}`
              : '',
            clientEmail: clientObj?.contactPerson?.email || '',
            clientPhone: clientObj?.contactPerson?.phone || '',
            status: data.status || 'draft',
            budget: data.budget?.total || 0,
            expenses: data.budget?.spent || 0,
            attendees: data.capacity || 0,
            currentRegistrations: data.currentRegistrations || 0,
            tasks: (data.tasks || []).map((t, idx) => ({
              id: idx + 1,
              name: t.name || t.title || 'Untitled Task',
              status: t.status || 'pending',
              dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
              assignedTo: t.assignedTo || '',
            })),
            vendors: (data.vendors || []).map((v, idx) => ({
              id: idx + 1,
              name: typeof v.vendor === 'object' ? v.vendor.businessName : (v.vendor || 'Unknown'),
              service: v.service || '',
              contact: typeof v.vendor === 'object' && v.vendor.contactPerson
                ? `${v.vendor.contactPerson.firstName} ${v.vendor.contactPerson.lastName}`
                : '',
              phone: typeof v.vendor === 'object' && v.vendor.contactPerson
                ? v.vendor.contactPerson.phone || ''
                : '',
              cost: v.cost || 0,
            })),
            staff: (data.staff || []).map((s, idx) => ({
              id: idx + 1,
              name: typeof s.user === 'object'
                ? `${s.user.firstName} ${s.user.lastName}`
                : (s.user || 'Unknown'),
              role: s.role || '',
              email: typeof s.user === 'object' ? s.user.email : '',
            })),
          };
          setEvent(mapped);
        } else {
          const errData = await response.json().catch(() => ({}));
          setError(errData.message || 'Failed to load event details.');
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Network error. Make sure the server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) { alert('Please login first'); return; }

      const response = await fetch(`${API}/api/events/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setEvent(prev => ({ ...prev, status: newStatus }));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error updating status');
      }
    } catch (err) {
      console.error('Error updating event status:', err);
      alert('Network error updating status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
        <Link to="/events" className="btn btn-outline-secondary">Back to Events</Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">Event not found.</div>
        <Link to="/events" className="btn btn-outline-secondary">Back to Events</Link>
      </div>
    );
  }

  const budgetUsed = event.budget > 0 ? (event.expenses / event.budget) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container mt-4 mb-5">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <Link to="/events" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-1"></i>Back
            </Link>
            <h2 className="mb-0">{event.name}</h2>
            {event.eventType && (
              <span className="badge bg-primary">{event.eventType}</span>
            )}
          </div>
          <div className="d-flex align-items-center gap-2">
            <label className="fw-medium text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Status:</label>
            <select
              className="form-select form-select-sm fw-semibold"
              value={event.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              style={{
                width: 'auto',
                minWidth: '140px',
                backgroundColor: event.status === 'completed' ? '#d1fae5' : event.status === 'published' ? '#dbeafe' : event.status === 'cancelled' ? '#fee2e2' : '#f3f4f6',
                color: event.status === 'completed' ? '#065f46' : event.status === 'published' ? '#1e40af' : event.status === 'cancelled' ? '#991b1b' : '#374151',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: event.status === 'completed' ? '#6ee7b7' : event.status === 'published' ? '#93c5fd' : event.status === 'cancelled' ? '#fca5a5' : '#d1d5db',
                cursor: 'pointer'
              }}
            >
              <option value="draft">📝 Draft</option>
              <option value="published">🟢 Published</option>
              <option value="completed">✅ Completed</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>
        </div>

        {/* Event Info */}
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card glass-card mb-4">
              <div className="card-header">Event Information</div>
              <div className="card-body">
                <div className="row mb-2">
                  <div className="col-sm-4 fw-bold" style={{ color: 'var(--text-secondary)' }}>Type</div>
                  <div className="col-sm-8">{event.eventType || 'N/A'}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-sm-4 fw-bold" style={{ color: 'var(--text-secondary)' }}>Date</div>
                  <div className="col-sm-8">{event.date}{event.endDate ? ` - ${event.endDate}` : ''}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-sm-4 fw-bold" style={{ color: 'var(--text-secondary)' }}>Location</div>
                  <div className="col-sm-8">{event.location || 'N/A'}</div>
                </div>
                {event.address && (
                  <div className="row mb-2">
                    <div className="col-sm-4 fw-bold" style={{ color: 'var(--text-secondary)' }}>Address</div>
                    <div className="col-sm-8">{event.address}</div>
                  </div>
                )}
                <div className="row mb-2">
                  <div className="col-sm-4 fw-bold" style={{ color: 'var(--text-secondary)' }}>Capacity</div>
                  <div className="col-sm-8">{event.attendees}</div>
                </div>
                {event.description && (
                  <div className="row mt-3">
                    <div className="col-sm-4 fw-bold" style={{ color: 'var(--text-secondary)' }}>Description</div>
                    <div className="col-sm-8">{event.description}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Budget */}
            <div className="card glass-card mb-4">
              <div className="card-header">Budget</div>
              <div className="card-body">
                <div className="row mb-2">
                  <div className="col-sm-4 fw-bold" style={{ color: 'var(--text-secondary)' }}>Total Budget</div>
                  <div className="col-sm-8">${event.budget.toLocaleString()}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-sm-4 fw-bold" style={{ color: 'var(--text-secondary)' }}>Expenses</div>
                  <div className="col-sm-8">${event.expenses.toLocaleString()}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-sm-4 fw-bold" style={{ color: 'var(--text-secondary)' }}>Remaining</div>
                  <div className="col-sm-8">${(event.budget - event.expenses).toLocaleString()}</div>
                </div>
                {event.budget > 0 && (
                  <div className="progress mt-3" style={{ height: '8px' }}>
                    <div
                      className={`progress-bar ${budgetUsed > 90 ? 'bg-danger' : 'bg-success'}`}
                      role="progressbar"
                      style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                      aria-valuenow={budgetUsed}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                )}
                {event.budget > 0 && (
                  <small className="text-muted mt-1 d-block">{Math.round(budgetUsed)}% used</small>
                )}
              </div>
            </div>

            {/* Vendors */}
            <div className="card glass-card mb-4">
              <div className="card-header">Vendors</div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Vendor</th>
                        <th>Service</th>
                        <th>Contact</th>
                        <th>Phone</th>
                        <th>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.vendors.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center text-muted py-3">No vendors assigned</td>
                        </tr>
                      ) : (
                        event.vendors.map((v) => (
                          <tr key={v.id}>
                            <td>{v.name}</td>
                            <td>{v.service}</td>
                            <td>{v.contact}</td>
                            <td>{v.phone}</td>
                            <td>${v.cost.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Staff */}
            <div className="card glass-card mb-4">
              <div className="card-header">Staff</div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.staff.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="text-center text-muted py-3">No staff assigned</td>
                        </tr>
                      ) : (
                        event.staff.map((s) => (
                          <tr key={s.id}>
                            <td>{s.name}</td>
                            <td>{s.role}</td>
                            <td><a href={`mailto:${s.email}`}>{s.email}</a></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Client */}
            <div className="card glass-card mb-4">
              <div className="card-header">Client</div>
              <div className="card-body">
                <div className="mb-2">
                  <small className="fw-bold" style={{ color: 'var(--text-secondary)' }}>Company</small>
                  <div>{event.client || 'N/A'}</div>
                </div>
                <div className="mb-2">
                  <small className="fw-bold" style={{ color: 'var(--text-secondary)' }}>Contact</small>
                  <div>{event.clientContact || 'N/A'}</div>
                </div>
                {event.clientEmail && (
                  <div className="mb-2">
                    <small className="fw-bold" style={{ color: 'var(--text-secondary)' }}>Email</small>
                    <div><a href={`mailto:${event.clientEmail}`}>{event.clientEmail}</a></div>
                  </div>
                )}
                {event.clientPhone && (
                  <div className="mb-2">
                    <small className="fw-bold" style={{ color: 'var(--text-secondary)' }}>Phone</small>
                    <div><a href={`tel:${event.clientPhone}`}>{event.clientPhone}</a></div>
                  </div>
                )}
              </div>
            </div>

            {/* Tasks / Timeline */}
            <div className="card glass-card mb-4">
              <div className="card-header">Tasks</div>
              <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                  {event.tasks.length === 0 ? (
                    <li className="list-group-item text-muted text-center py-3">No tasks</li>
                  ) : (
                    event.tasks.map((task) => (
                      <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <span className={`badge me-2 ${taskStatusBadge(task.status)}`}>
                            {taskStatusLabel(task.status)}
                          </span>
                          {task.name}
                        </div>
                        {task.dueDate && <small className="text-muted">{task.dueDate}</small>}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card glass-card">
              <div className="card-header">Quick Stats</div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Vendors</span>
                  <span className="fw-bold">{event.vendors.length}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Staff</span>
                  <span className="fw-bold">{event.staff.length}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Tasks</span>
                  <span className="fw-bold">{event.tasks.length}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Capacity</span>
                  <span className="fw-bold">{event.attendees}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default EventDetails;
