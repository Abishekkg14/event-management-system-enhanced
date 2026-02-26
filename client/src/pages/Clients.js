import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.07 } }
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [clientBeingEdited, setClientBeingEdited] = useState(null);
  const [newClient, setNewClient] = useState({
    companyName: '',
    contactPerson: { firstName: '', lastName: '', email: '', phone: '', position: '' },
    address: { street: '', city: '', state: '', country: '', zipCode: '' },
    industry: '',
    companySize: 'small',
    website: '',
    notes: ''
  });

  useEffect(() => {
    fetchClients();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API}/api/clients`, {
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
          email: client.contactPerson?.email || '',
          phone: client.contactPerson?.phone || '',
          type: client.companySize === 'large' || client.companySize === 'enterprise' ? 'Corporate' :
            client.industry === 'non-profit' ? 'Non-profit' : 'Small Business',
          events: client.totalEvents || 0,
          totalSpent: client.totalSpent || 0
        }));
        setClients(formattedClients);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setLoading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) { alert('Please login first'); return; }

      const response = await fetch(`${API}/api/clients`, {
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
          email: data.client.contactPerson?.email || '',
          phone: data.client.contactPerson?.phone || '',
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

  const handleDeleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API}/api/clients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setClients(clients.filter(c => c.id !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error deleting client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error deleting client. Please try again.');
    }
  };

  const openEditClient = (client) => {
    setClientBeingEdited(client);
    setShowEditModal(true);
  };

  const handleEditChange = (path, value) => {
    setClientBeingEdited(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
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
    setClients(clients.map(c => c.id === clientBeingEdited.id ? clientBeingEdited : c));
    setShowEditModal(false);
    setClientBeingEdited(null);
  };

  const resetForm = () => {
    setNewClient({
      companyName: '',
      contactPerson: { firstName: '', lastName: '', email: '', phone: '', position: '' },
      address: { street: '', city: '', state: '', country: '', zipCode: '' },
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
    (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'Corporate': return 'bg-primary';
      case 'Non-profit': return 'bg-success';
      case 'Government': return 'bg-warning';
      case 'Individual': return 'bg-danger';
      case 'Small Business': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants}>
      <motion.div className="d-flex justify-content-between align-items-center mb-4" variants={rowVariants}>
        <h2 className="fw-bold mb-0">Clients</h2>
        <div className="d-flex gap-2">
          <input type="text" className="form-control bg-white shadow-sm" placeholder="Search clients..." value={searchTerm}
            onChange={handleSearch} style={{ maxWidth: 250 }} />
          <button className="btn btn-primary shadow-sm" onClick={() => setShowAddModal(true)}>
            <i className="bi bi-plus-lg me-1"></i> Add New Client
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="premium-card">
          <div className="card-body text-center py-5">
            <i className="bi bi-people" style={{ fontSize: '3rem', color: 'var(--text-secondary)' }}></i>
            <p className="text-muted mt-3 mb-0" style={{ fontSize: '1.1rem' }}>
              {searchTerm ? 'No clients found matching your search.' : 'No clients yet. Add your first client to get started!'}
            </p>
          </div>
        </div>
      ) : (
        <div className="premium-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Type</th>
                  <th>Events</th>
                  <th>Total Spent</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <motion.tbody variants={pageVariants} initial="hidden" animate="visible" className="border-top-0">
                {filteredClients.map((client) => (
                  <motion.tr key={client.id} variants={rowVariants}>
                    <td className="fw-semibold text-dark">{client.name}</td>
                    <td className="text-secondary">{client.contactPerson}</td>
                    <td><a href={`mailto:${client.email}`} className="text-decoration-none">{client.email}</a></td>
                    <td><a href={`tel:${client.phone}`} className="text-decoration-none text-secondary">{client.phone}</a></td>
                    <td>
                      <span className={`badge ${getTypeBadgeClass(client.type)}`}>{client.type}</span>
                    </td>
                    <td className="text-secondary">{client.events}</td>
                    <td className="fw-medium">${client.totalSpent.toLocaleString()}</td>
                    <td>
                      <div className="d-flex gap-2 justify-content-end">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEditClient(client)} title="Edit Client">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClient(client.id)} title="Delete Client">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 30, 58, 0.4)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-light border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold text-dark">Add New Client</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)} />
              </div>
              <form onSubmit={handleAddClient}>
                <div className="modal-body px-4 py-4">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium text-secondary">Company Name *</label>
                      <input type="text" className="form-control bg-white" value={newClient.companyName}
                        onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Industry</label>
                      <input type="text" className="form-control" value={newClient.industry}
                        onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact First Name *</label>
                      <input type="text" className="form-control" value={newClient.contactPerson.firstName}
                        onChange={(e) => setNewClient({ ...newClient, contactPerson: { ...newClient.contactPerson, firstName: e.target.value } })} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact Last Name *</label>
                      <input type="text" className="form-control" value={newClient.contactPerson.lastName}
                        onChange={(e) => setNewClient({ ...newClient, contactPerson: { ...newClient.contactPerson, lastName: e.target.value } })} required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact Email *</label>
                      <input type="email" className="form-control" value={newClient.contactPerson.email}
                        onChange={(e) => setNewClient({ ...newClient, contactPerson: { ...newClient.contactPerson, email: e.target.value } })} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact Phone</label>
                      <input type="tel" className="form-control" value={newClient.contactPerson.phone}
                        onChange={(e) => setNewClient({ ...newClient, contactPerson: { ...newClient.contactPerson, phone: e.target.value } })} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Position</label>
                      <input type="text" className="form-control" value={newClient.contactPerson.position}
                        onChange={(e) => setNewClient({ ...newClient, contactPerson: { ...newClient.contactPerson, position: e.target.value } })} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Company Size</label>
                      <select className="form-select" value={newClient.companySize}
                        onChange={(e) => setNewClient({ ...newClient, companySize: e.target.value })}>
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
                      <input type="url" className="form-control" value={newClient.website}
                        onChange={(e) => setNewClient({ ...newClient, website: e.target.value })} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">City</label>
                      <input type="text" className="form-control" value={newClient.address.city}
                        onChange={(e) => setNewClient({ ...newClient, address: { ...newClient.address, city: e.target.value } })} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium text-secondary">Notes</label>
                    <textarea className="form-control bg-white" rows="3" value={newClient.notes}
                      onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer bg-light px-4 py-3 border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Add Client</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && clientBeingEdited && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 30, 58, 0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-light border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold text-dark">Edit Client</h5>
                <button type="button" className="btn-close" onClick={() => { setShowEditModal(false); setClientBeingEdited(null); }} />
              </div>
              <form onSubmit={handleSaveClient}>
                <div className="modal-body px-4 py-4">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" value={clientBeingEdited.name}
                      onChange={(e) => handleEditChange('name', e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contact Person</label>
                    <input type="text" className="form-control" value={clientBeingEdited.contactPerson}
                      onChange={(e) => handleEditChange('contactPerson', e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={clientBeingEdited.email}
                      onChange={(e) => handleEditChange('email', e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input type="tel" className="form-control" value={clientBeingEdited.phone}
                      onChange={(e) => handleEditChange('phone', e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={clientBeingEdited.type}
                      onChange={(e) => handleEditChange('type', e.target.value)}>
                      <option value="Corporate">Corporate</option>
                      <option value="Non-profit">Non-profit</option>
                      <option value="Government">Government</option>
                      <option value="Individual">Individual</option>
                      <option value="Small Business">Small Business</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer bg-light px-4 py-3 border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => { setShowEditModal(false); setClientBeingEdited(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default Clients;
