import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [clientBeingEdited, setClientBeingEdited] = useState(null);
  const [newClient, setNewClient] = useState({
    companyName: '',
    contactPerson: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    industry: '',
    companySize: 'small',
    website: '',
    notes: ''
  });

  // Mock client data
  const mockClients = [
    {
      id: 1,
      name: 'TechCorp Inc.',
      contactPerson: 'John Smith',
      email: 'john.smith@techcorp.com',
      phone: '(555) 123-4567',
      type: 'Corporate',
      events: 4,
      totalSpent: 120000
    },
    {
      id: 2,
      name: 'Hope Foundation',
      contactPerson: 'Maria Rodriguez',
      email: 'maria@hopefoundation.org',
      phone: '(555) 234-5678',
      type: 'Non-profit',
      events: 2,
      totalSpent: 45000
    },
    {
      id: 3,
      name: 'NextGen Devices',
      contactPerson: 'David Chen',
      email: 'david.chen@nextgendevices.com',
      phone: '(555) 345-6789',
      type: 'Corporate',
      events: 3,
      totalSpent: 95000
    },
    {
      id: 4,
      name: 'Global Finance Group',
      contactPerson: 'Sarah Johnson',
      email: 'sjohnson@globalfinance.com',
      phone: '(555) 456-7890',
      type: 'Corporate',
      events: 2,
      totalSpent: 75000
    },
    {
      id: 5,
      name: 'City of Riverside',
      contactPerson: 'Michael Williams',
      email: 'm.williams@riverside.gov',
      phone: '(555) 567-8901',
      type: 'Government',
      events: 1,
      totalSpent: 30000
    },
    {
      id: 6,
      name: 'Jennifer Taylor',
      contactPerson: 'Jennifer Taylor',
      email: 'jennifer.taylor@email.com',
      phone: '(555) 678-9012',
      type: 'Individual',
      events: 2,
      totalSpent: 15000
    }
  ];

  useEffect(() => {
    fetchClients();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
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
        const formattedClients = data.clients.map(client => ({
          id: client._id,
          name: client.companyName,
          companyName: client.companyName,
          contactPerson: `${client.contactPerson?.firstName} ${client.contactPerson?.lastName}`,
          email: client.contactPerson?.email,
          phone: client.contactPerson?.phone,
          type: client.companySize === 'large' || client.companySize === 'enterprise' ? 'Corporate' : 
                client.industry === 'non-profit' ? 'Non-profit' : 'Small Business',
          events: client.totalEvents || 0,
          totalSpent: client.totalSpent || 0
        }));
        setClients(formattedClients);
      } else {
        console.error('Failed to fetch clients:', response.statusText);
        // Fallback to mock data
        setClients(mockClients);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Fallback to mock data
      setClients(mockClients);
      setLoading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await fetch('http://localhost:5000/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newClient)
      });

      if (response.ok) {
        const data = await response.json();
        const formattedNewClient = {
          id: data.client._id,
          name: data.client.companyName,
          companyName: data.client.companyName,
          contactPerson: `${data.client.contactPerson?.firstName} ${data.client.contactPerson?.lastName}`,
          email: data.client.contactPerson?.email,
          phone: data.client.contactPerson?.phone,
          type: data.client.companySize === 'large' || data.client.companySize === 'enterprise' ? 'Corporate' : 
                data.client.industry === 'non-profit' ? 'Non-profit' : 'Small Business',
          events: 0,
          totalSpent: 0
        };
        setClients([...clients, formattedNewClient]);
        setShowAddModal(false);
        resetForm();
        alert('Client added successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error adding client');
      }
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Error adding client. Please try again.');
    }
  };

  const handleDeleteClient = (id) => {
    if (!window.confirm('Delete this client?')) return;
    // For production, call DELETE /api/clients/:id
    setClients(clients.filter(c => c.id !== id));
  };

  const openEditClient = (client) => {
    setClientBeingEdited(client);
    setShowEditModal(true);
  };

  const handleEditChange = (path, value) => {
    setClientBeingEdited(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      // simple paths we expose in the UI
      if (path === 'name') updated.name = value;
      if (path === 'contactPerson') updated.contactPerson = value;
      if (path === 'email') updated.email = value;
      if (path === 'phone') updated.phone = value;
      if (path === 'type') updated.type = value;
      return updated;
    });
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!clientBeingEdited) return;
    // For production, call PUT /api/clients/:id
    setClients(clients.map(c => c.id === clientBeingEdited.id ? clientBeingEdited : c));
    setShowEditModal(false);
    setClientBeingEdited(null);
  };

  const resetForm = () => {
    setNewClient({
      companyName: '',
      contactPerson: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: ''
      },
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
      },
      industry: '',
      companySize: 'small',
      website: '',
      notes: ''
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Clients</h2>
          <div className="d-flex">
            <div className="input-group me-2">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search clients..." 
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className="btn btn-outline-secondary" type="button">
                <i className="bi bi-search"></i>
              </button>
            </div>
            <button 
              className="btn btn-success"
              onClick={() => setShowAddModal(true)}
            >
              <i className="bi bi-plus-lg"></i> Add New Client
            </button>
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row">
            {filteredClients.map((client) => (
              <div key={client.id} className="col-md-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{client.name}</h5>
                    <span className={`badge ${
                      client.type === 'Corporate' ? 'bg-primary' : 
                      client.type === 'Non-profit' ? 'bg-success' :
                      client.type === 'Government' ? 'bg-info' : 'bg-secondary'
                    } mb-3`}>{client.type}</span>
                    
                    <div className="card-text">
                      <p><strong>Contact:</strong> {client.contactPerson}</p>
                      <p>
                        <strong>Email:</strong> <a href={`mailto:${client.email}`}>{client.email}</a>
                      </p>
                      <p>
                        <strong>Phone:</strong> <a href={`tel:${client.phone}`}>{client.phone}</a>
                      </p>
                      <p><strong>Events:</strong> {client.events}</p>
                      <p><strong>Total Spent:</strong> ${client.totalSpent.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="card-footer bg-transparent d-flex justify-content-between">
                    <button className="btn btn-outline-primary" onClick={() => openEditClient(client)}>
                      <i className="bi bi-pencil"></i> Edit
                    </button>
                    <button className="btn btn-outline-danger" onClick={() => handleDeleteClient(client.id)}>
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredClients.length === 0 && !loading && (
              <div className="text-center p-5">
                <h4>No clients found matching your search.</h4>
                <p>Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Client</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddClient}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Company Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newClient.companyName}
                        onChange={(e) => setNewClient({...newClient, companyName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Industry</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newClient.industry}
                        onChange={(e) => setNewClient({...newClient, industry: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact First Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newClient.contactPerson.firstName}
                        onChange={(e) => setNewClient({
                          ...newClient,
                          contactPerson: {...newClient.contactPerson, firstName: e.target.value}
                        })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact Last Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newClient.contactPerson.lastName}
                        onChange={(e) => setNewClient({
                          ...newClient,
                          contactPerson: {...newClient.contactPerson, lastName: e.target.value}
                        })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={newClient.contactPerson.email}
                        onChange={(e) => setNewClient({
                          ...newClient,
                          contactPerson: {...newClient.contactPerson, email: e.target.value}
                        })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={newClient.contactPerson.phone}
                        onChange={(e) => setNewClient({
                          ...newClient,
                          contactPerson: {...newClient.contactPerson, phone: e.target.value}
                        })}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Position</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newClient.contactPerson.position}
                        onChange={(e) => setNewClient({
                          ...newClient,
                          contactPerson: {...newClient.contactPerson, position: e.target.value}
                        })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Company Size</label>
                      <select
                        className="form-select"
                        value={newClient.companySize}
                        onChange={(e) => setNewClient({...newClient, companySize: e.target.value})}
                      >
                        <option value="startup">Startup</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Website</label>
                      <input
                        type="url"
                        className="form-control"
                        value={newClient.website}
                        onChange={(e) => setNewClient({...newClient, website: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newClient.address.city}
                        onChange={(e) => setNewClient({
                          ...newClient,
                          address: {...newClient.address, city: e.target.value}
                        })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newClient.notes}
                      onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                    ></textarea>
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
                    Add Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && clientBeingEdited && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Client</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => { setShowEditModal(false); setClientBeingEdited(null); }}
                ></button>
              </div>
              <form onSubmit={handleSaveClient}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={clientBeingEdited.name}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contact Person</label>
                    <input
                      type="text"
                      className="form-control"
                      value={clientBeingEdited.contactPerson}
                      onChange={(e) => handleEditChange('contactPerson', e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={clientBeingEdited.email}
                      onChange={(e) => handleEditChange('email', e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={clientBeingEdited.phone}
                      onChange={(e) => handleEditChange('phone', e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={clientBeingEdited.type}
                      onChange={(e) => handleEditChange('type', e.target.value)}
                    >
                      <option value="Corporate">Corporate</option>
                      <option value="Non-profit">Non-profit</option>
                      <option value="Government">Government</option>
                      <option value="Individual">Individual</option>
                      <option value="Small Business">Small Business</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => { setShowEditModal(false); setClientBeingEdited(null); }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clients;
