import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  // Mock event data
  const mockEvent = {
    id: id,
    name: 'Tech Conference 2023',
    date: '2023-10-15',
    endDate: '2023-10-17',
    location: 'Convention Center, New York',
    address: '123 Convention Plaza, New York, NY 10001',
    client: 'TechCorp Inc.',
    clientContact: 'John Smith',
    clientEmail: 'john.smith@techcorp.com',
    clientPhone: '(555) 123-4567',
    status: 'upcoming',
    budget: 45000,
    expenses: 32000,
    attendees: 500,
    description: 'Annual technology conference featuring keynote speakers, workshops, and networking opportunities for industry professionals.',
    tasks: [
      { id: 1, name: 'Venue booking', status: 'completed', dueDate: '2023-07-15', assignedTo: 'Emily Johnson' },
      { id: 2, name: 'Speaker invitations', status: 'completed', dueDate: '2023-08-01', assignedTo: 'Michael Brown' },
      { id: 3, name: 'Catering arrangements', status: 'in-progress', dueDate: '2023-09-15', assignedTo: 'Sarah Williams' },
      { id: 4, name: 'Technical equipment setup', status: 'pending', dueDate: '2023-10-10', assignedTo: 'Robert Davis' },
      { id: 5, name: 'Marketing materials', status: 'in-progress', dueDate: '2023-09-01', assignedTo: 'Jennifer Miller' }
    ],
    vendors: [
      { id: 1, name: 'Elite Catering', service: 'Food & Beverage', contact: 'Alice Green', phone: '(555) 234-5678', cost: 12000 },
      { id: 2, name: 'Sound Masters', service: 'Audio/Visual', contact: 'David Wilson', phone: '(555) 345-6789', cost: 8000 },
      { id: 3, name: 'Décor Experts', service: 'Event Decoration', contact: 'Lisa Taylor', phone: '(555) 456-7890', cost: 5000 }
    ],
    staff: [
      { id: 1, name: 'Emily Johnson', role: 'Event Manager', email: 'emily.j@eventco.com' },
      { id: 2, name: 'Michael Brown', role: 'Logistics Coordinator', email: 'michael.b@eventco.com' },
      { id: 3, name: 'Sarah Williams', role: 'Client Liaison', email: 'sarah.w@eventco.com' }
    ]
  };

  useEffect(() => {
    // Simulate API call with setTimeout
    setTimeout(() => {
      setEvent(mockEvent);
      setLoading(false);
    }, 800);
  }, [id]);

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Link to="/events" className="btn btn-outline-secondary me-2">
              <i className="bi bi-arrow-left"></i> Back to Events
            </Link>
            <h2 className="d-inline-block">{event.name}</h2>
            <span className={`badge ms-2 ${event.status === 'upcoming' ? 'bg-warning' : 'bg-success'}`}>
              {event.status === 'upcoming' ? 'Upcoming' : 'Completed'}
            </span>
          </div>
          <div>
            <button className="btn btn-primary me-2">
              <i className="bi bi-pencil"></i> Edit Event
            </button>
            <button className="btn btn-danger">
              <i className="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>

        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'details' ? 'active' : ''}`} 
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`} 
              onClick={() => setActiveTab('tasks')}
            >
              Tasks
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'vendors' ? 'active' : ''}`} 
              onClick={() => setActiveTab('vendors')}
            >
              Vendors
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'staff' ? 'active' : ''}`} 
              onClick={() => setActiveTab('staff')}
            >
              Staff
            </button>
          </li>
        </ul>

        {activeTab === 'details' && (
          <div className="row">
            <div className="col-md-8">
              <div className="card mb-4">
                <div className="card-header">
                  Event Information
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-3 fw-bold">Date:</div>
                    <div className="col-md-9">{event.date} to {event.endDate}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-3 fw-bold">Location:</div>
                    <div className="col-md-9">{event.location}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-3 fw-bold">Address:</div>
                    <div className="col-md-9">{event.address}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-3 fw-bold">Expected Attendees:</div>
                    <div className="col-md-9">{event.attendees}</div>
                  </div>
                  <div className="row">
                    <div className="col-md-3 fw-bold">Description:</div>
                    <div className="col-md-9">{event.description}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  Budget Summary
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-3 fw-bold">Total Budget:</div>
                    <div className="col-md-9">${event.budget.toLocaleString()}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-3 fw-bold">Current Expenses:</div>
                    <div className="col-md-9">${event.expenses.toLocaleString()}</div>
                  </div>
                  <div className="row">
                    <div className="col-md-3 fw-bold">Remaining:</div>
                    <div className="col-md-9">${(event.budget - event.expenses).toLocaleString()}</div>
                  </div>
                  <div className="progress mt-3">
                    <div 
                      className={`progress-bar ${(event.expenses / event.budget) > 0.9 ? 'bg-danger' : 'bg-success'}`} 
                      role="progressbar" 
                      style={{width: `${(event.expenses / event.budget) * 100}%`}} 
                      aria-valuenow={(event.expenses / event.budget) * 100} 
                      aria-valuemin="0" 
                      aria-valuemax="100">
                      {Math.round((event.expenses / event.budget) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card mb-4">
                <div className="card-header">
                  Client Information
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-4 fw-bold">Name:</div>
                    <div className="col-md-8">{event.client}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4 fw-bold">Contact:</div>
                    <div className="col-md-8">{event.clientContact}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4 fw-bold">Email:</div>
                    <div className="col-md-8">
                      <a href={`mailto:${event.clientEmail}`}>{event.clientEmail}</a>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 fw-bold">Phone:</div>
                    <div className="col-md-8">
                      <a href={`tel:${event.clientPhone}`}>{event.clientPhone}</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  Event Timeline
                </div>
                <div className="card-body p-0">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-success me-2">✓</span>
                        Venue Booked
                      </div>
                      <span className="text-muted">Jul 15, 2023</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-success me-2">✓</span>
                        Speakers Confirmed
                      </div>
                      <span className="text-muted">Aug 1, 2023</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-warning me-2">⋯</span>
                        Marketing Materials
                      </div>
                      <span className="text-muted">Sep 1, 2023</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-warning me-2">⋯</span>
                        Catering Arrangements
                      </div>
                      <span className="text-muted">Sep 15, 2023</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span className="badge bg-secondary me-2">○</span>
                        Technical Setup
                      </div>
                      <span className="text-muted">Oct 10, 2023</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Task List</span>
              <button className="btn btn-sm btn-success">
                <i className="bi bi-plus-lg"></i> Add Task
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Task Name</th>
                      <th>Status</th>
                      <th>Due Date</th>
                      <th>Assigned To</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.tasks.map((task) => (
                      <tr key={task.id}>
                        <td>{task.name}</td>
                        <td>
                          <span className={`badge ${
                            task.status === 'completed' ? 'bg-success' : 
                            task.status === 'in-progress' ? 'bg-warning' : 'bg-secondary'
                          }`}>
                            {task.status === 'completed' ? 'Completed' : 
                             task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                          </span>
                        </td>
                        <td>{task.dueDate}</td>
                        <td>{task.assignedTo}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger">
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Vendors</span>
              <button className="btn btn-sm btn-success">
                <i className="bi bi-plus-lg"></i> Add Vendor
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Vendor Name</th>
                      <th>Service</th>
                      <th>Contact Person</th>
                      <th>Phone</th>
                      <th>Cost</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.vendors.map((vendor) => (
                      <tr key={vendor.id}>
                        <td>{vendor.name}</td>
                        <td>{vendor.service}</td>
                        <td>{vendor.contact}</td>
                        <td>{vendor.phone}</td>
                        <td>${vendor.cost.toLocaleString()}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger">
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Staff Assigned</span>
              <button className="btn btn-sm btn-success">
                <i className="bi bi-plus-lg"></i> Assign Staff
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.staff.map((person) => (
                      <tr key={person.id}>
                        <td>{person.name}</td>
                        <td>{person.role}</td>
                        <td>
                          <a href={`mailto:${person.email}`}>{person.email}</a>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-danger">
                            <i className="bi bi-x-lg"></i> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetails;
