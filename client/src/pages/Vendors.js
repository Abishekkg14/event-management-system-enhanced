import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [vendorBeingEdited, setVendorBeingEdited] = useState(null);
  const [newVendor, setNewVendor] = useState({
    businessName: '',
    contactPerson: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: ''
    },
    services: [],
    address: {
      city: '',
      state: '',
      country: ''
    },
    website: '',
    pricing: {
      hourly: '',
      daily: '',
      currency: 'USD'
    },
    rating: { average: 1, count: 0 }
  });

  // Mock vendor data
  const mockVendors = [
    { id: 1, name: 'Elite Catering', category: 'Food & Beverage', contact: 'Alice Green', email: 'alice@elitecatering.com', phone: '(555) 234-5678', address: '123 Culinary Blvd, Chicago, IL 60601', rating: 4.8, events: 15 },
    { id: 2, name: 'Sound Masters', category: 'Audio/Visual', contact: 'David Wilson', email: 'david@soundmasters.com', phone: '(555) 345-6789', address: '456 Tech Lane, New York, NY 10001', rating: 4.5, events: 22 },
    { id: 3, name: 'Décor Experts', category: 'Event Decoration', contact: 'Lisa Taylor', email: 'lisa@decorexperts.com', phone: '(555) 456-7890', address: '789 Design Drive, Los Angeles, CA 90001', rating: 4.7, events: 18 },
    { id: 4, name: 'Swift Transport', category: 'Transportation', contact: 'Mark Johnson', email: 'mark@swifttransport.com', phone: '(555) 567-8901', address: '321 Transit Way, Boston, MA 02101', rating: 4.2, events: 11 },
    { id: 5, name: 'Security Plus', category: 'Security Services', contact: 'Robert Miller', email: 'robert@securityplus.com', phone: '(555) 678-9012', address: '654 Guard Street, Miami, FL 33101', rating: 4.9, events: 25 },
    { id: 6, name: 'Photo Memories', category: 'Photography', contact: 'Sarah Adams', email: 'sarah@photomemories.com', phone: '(555) 789-0123', address: '987 Camera Road, Seattle, WA 98101', rating: 4.6, events: 20 },
    { id: 7, name: 'FlowerWorks', category: 'Florals', contact: 'Emma Watson', email: 'emma@flowerworks.com', phone: '(555) 890-1234', address: '159 Petal Avenue, Portland, OR 97201', rating: 4.8, events: 16 },
    { id: 8, name: 'Stage Right Productions', category: 'Entertainment', contact: 'Thomas Clark', email: 'thomas@stageright.com', phone: '(555) 901-2345', address: '753 Performance Lane, Nashville, TN 37201', rating: 4.7, events: 19 }
  ];

  // List of unique categories for filter dropdown
  const categories = ['all', ...new Set(mockVendors.map(vendor => vendor.category))];

  useEffect(() => {
    fetchVendors();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/vendors', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedVendors = data.vendors.map(vendor => {
          const contactName = `${vendor.contactPerson?.firstName || ''} ${vendor.contactPerson?.lastName || ''}`.trim();
          const addressString = [
            vendor.address?.street,
            vendor.address?.city,
            vendor.address?.state,
            vendor.address?.country,
            vendor.address?.zipCode
          ].filter(Boolean).join(', ');
          return {
            id: vendor._id,
            name: vendor.businessName,
            businessName: vendor.businessName,
            contactPerson: vendor.contactPerson,
            contact: contactName || 'N/A',
            services: vendor.services,
            address: addressString || 'N/A',
            website: vendor.website,
            pricing: vendor.pricing,
            category: (vendor.services && vendor.services[0]) || 'other',
            rating: vendor.rating?.average || 4.0,
            reviews: vendor.rating?.count || 0,
            phone: vendor.contactPerson?.phone || 'N/A',
            email: vendor.contactPerson?.email || 'N/A',
            status: vendor.status || 'active'
          };
        });
        setVendors(formattedVendors);
      } else {
        console.error('Failed to fetch vendors:', response.statusText);
        // Fallback to mock data
        setVendors(mockVendors);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      // Fallback to mock data
      setVendors(mockVendors);
      setLoading(false);
    }
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await fetch('http://localhost:5000/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newVendor)
      });

      if (response.ok) {
        const data = await response.json();
        const addressString = [
          data.vendor.address?.street,
          data.vendor.address?.city,
          data.vendor.address?.state,
          data.vendor.address?.country,
          data.vendor.address?.zipCode
        ].filter(Boolean).join(', ');
        const formattedNewVendor = {
          id: data.vendor._id,
          name: data.vendor.businessName,
          businessName: data.vendor.businessName,
          contactPerson: data.vendor.contactPerson,
          contact: `${data.vendor.contactPerson?.firstName || ''} ${data.vendor.contactPerson?.lastName || ''}`.trim() || 'N/A',
          services: data.vendor.services,
          address: addressString || 'N/A',
          website: data.vendor.website,
          pricing: data.vendor.pricing,
          email: data.vendor.contactPerson?.email || 'N/A',
          phone: data.vendor.contactPerson?.phone || 'N/A',
          category: (data.vendor.services && data.vendor.services.length > 0) ? data.vendor.services[0] : 'Other',
          rating: data.vendor.rating?.average || 1,
          events: 0
        };
        setVendors([...vendors, formattedNewVendor]);
        setShowAddModal(false);
        resetForm();
        alert('Vendor added successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error adding vendor');
      }
    } catch (error) {
      console.error('Error adding vendor:', error);
      alert('Error adding vendor. Please try again.');
    }
  };

  const resetForm = () => {
    setNewVendor({
      businessName: '',
      contactPerson: { firstName: '', lastName: '', email: '', phone: '', position: '' },
      services: [],
      address: { city: '', state: '', country: '' },
      website: '',
      pricing: { hourly: '', daily: '', currency: 'USD' }
    });
  };

  const handleServiceChange = (service) => {
    const updatedServices = newVendor.services.includes(service)
      ? newVendor.services.filter(s => s !== service)
      : [...newVendor.services, service];
    setNewVendor({...newVendor, services: updatedServices});
  };

  const handleCategoryFilter = (e) => {
    setFilterCategory(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteVendor = (id) => {
    if (!window.confirm('Delete this vendor?')) return;
    // For production, call DELETE /api/vendors/:id
    setVendors(vendors.filter(v => v.id !== id));
  };

  const openEditVendor = (vendor) => {
    setVendorBeingEdited(vendor);
    setShowEditModal(true);
  };

  const handleEditChange = (path, value) => {
    setVendorBeingEdited(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      if (path === 'name') updated.name = value;
      if (path === 'category') updated.category = value;
      if (path === 'contact') updated.contact = value;
      if (path === 'email') updated.email = value;
      if (path === 'phone') updated.phone = value;
      if (path === 'address') updated.address = value;
      return updated;
    });
  };

  const handleSaveVendor = (e) => {
    e.preventDefault();
    if (!vendorBeingEdited) return;
    // For production, call PUT /api/vendors/:id
    setVendors(vendors.map(v => v.id === vendorBeingEdited.id ? vendorBeingEdited : v));
    setShowEditModal(false);
    setVendorBeingEdited(null);
  };

  // Filter vendors based on category and search term
  const filteredVendors = vendors.filter(vendor => {
    const matchesCategory = filterCategory === 'all' || vendor.category === filterCategory;
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Generate star rating display
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    for (let i = 0; i < fullStars; i++) stars.push(<i key={`full-${i}`} className="bi bi-star-fill text-warning"></i>);
    if (hasHalfStar) stars.push(<i key="half" className="bi bi-star-half text-warning"></i>);
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) stars.push(<i key={`empty-${i}`} className="bi bi-star text-warning"></i>);
    return stars;
  };

  return (
    <div className="container-fluid">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Vendors</h2>
          <div>
            <button 
              className="btn btn-success"
              onClick={() => setShowAddModal(true)}
            >
              <i className="bi bi-plus-lg"></i> Add New Vendor
            </button>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <input type="text" className="form-control" placeholder="Search vendors..." value={searchTerm} onChange={handleSearch} />
              <button className="btn btn-outline-secondary" type="button"><i className="bi bi-search"></i></button>
            </div>
          </div>
          <div className="col-md-6">
            <select className="form-select" value={filterCategory} onChange={handleCategoryFilter}>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category === 'all' ? 'All Categories' : category}</option>
              ))}
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
          <div className="row">
            {filteredVendors.map((vendor) => (
              <div key={vendor.id} className="col-md-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{vendor.name}</h5>
                    <span className="badge bg-info mb-2">{vendor.category}</span>
                    <div className="mb-2">{renderStars(vendor.rating)}<span className="ms-2">{vendor.rating}</span></div>
                    <div className="card-text">
                      <p><strong>Contact:</strong> {vendor.contact}</p>
                      <p><strong>Email:</strong> <a href={`mailto:${vendor.email}`}>{vendor.email}</a></p>
                      <p><strong>Phone:</strong> <a href={`tel:${vendor.phone}`}>{vendor.phone}</a></p>
                      <p><strong>Address:</strong> {vendor.address}</p>
                      <p><strong>Events:</strong> {vendor.events}</p>
                    </div>
                  </div>
                  <div className="card-footer bg-transparent d-flex justify-content-between">
                    <button className="btn btn-outline-primary" onClick={() => openEditVendor(vendor)}>
                      <i className="bi bi-pencil"></i> Edit
                    </button>
                    <button className="btn btn-outline-danger" onClick={() => handleDeleteVendor(vendor.id)}>
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredVendors.length === 0 && !loading && (
              <div className="text-center p-5"><h4>No vendors found matching your criteria.</h4><p>Try adjusting your search or filter settings.</p></div>
            )}
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Vendor</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddVendor}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Business Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newVendor.businessName}
                        onChange={(e) => setNewVendor({...newVendor, businessName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Website</label>
                      <input
                        type="url"
                        className="form-control"
                        value={newVendor.website}
                        onChange={(e) => setNewVendor({...newVendor, website: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact First Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newVendor.contactPerson.firstName}
                        onChange={(e) => setNewVendor({
                          ...newVendor,
                          contactPerson: {...newVendor.contactPerson, firstName: e.target.value}
                        })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact Last Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newVendor.contactPerson.lastName}
                        onChange={(e) => setNewVendor({
                          ...newVendor,
                          contactPerson: {...newVendor.contactPerson, lastName: e.target.value}
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
                        value={newVendor.contactPerson.email}
                        onChange={(e) => setNewVendor({
                          ...newVendor,
                          contactPerson: {...newVendor.contactPerson, email: e.target.value}
                        })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contact Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={newVendor.contactPerson.phone}
                        onChange={(e) => setNewVendor({
                          ...newVendor,
                          contactPerson: {...newVendor.contactPerson, phone: e.target.value}
                        })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Services *</label>
                    <div className="row">
                      {['catering', 'audio-visual', 'photography', 'videography', 'decorations', 'security', 'transportation', 'entertainment'].map(service => (
                        <div key={service} className="col-md-3 mb-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={service}
                              checked={newVendor.services.includes(service)}
                              onChange={() => handleServiceChange(service)}
                            />
                            <label className="form-check-label" htmlFor={service}>
                              {service.charAt(0).toUpperCase() + service.slice(1)}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newVendor.address.city}
                        onChange={(e) => setNewVendor({
                          ...newVendor,
                          address: {...newVendor.address, city: e.target.value}
                        })}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newVendor.address.state}
                        onChange={(e) => setNewVendor({
                          ...newVendor,
                          address: {...newVendor.address, state: e.target.value}
                        })}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Country</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newVendor.address.country}
                        onChange={(e) => setNewVendor({
                          ...newVendor,
                          address: {...newVendor.address, country: e.target.value}
                        })}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Hourly Rate ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={newVendor.pricing.hourly}
                        onChange={(e) => setNewVendor({
                          ...newVendor,
                          pricing: {...newVendor.pricing, hourly: e.target.value}
                        })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Daily Rate ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={newVendor.pricing.daily}
                        onChange={(e) => setNewVendor({
                          ...newVendor,
                          pricing: {...newVendor.pricing, daily: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Vendor</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {showEditModal && vendorBeingEdited && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Vendor</h5>
                <button type="button" className="btn-close" onClick={() => { setShowEditModal(false); setVendorBeingEdited(null); }}></button>
              </div>
              <form onSubmit={handleSaveVendor}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Business Name</label>
                    <input type="text" className="form-control" value={vendorBeingEdited.name} onChange={(e) => handleEditChange('name', e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <input type="text" className="form-control" value={vendorBeingEdited.category} onChange={(e) => handleEditChange('category', e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contact</label>
                    <input type="text" className="form-control" value={vendorBeingEdited.contact} onChange={(e) => handleEditChange('contact', e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={vendorBeingEdited.email} onChange={(e) => handleEditChange('email', e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input type="tel" className="form-control" value={vendorBeingEdited.phone} onChange={(e) => handleEditChange('phone', e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input type="text" className="form-control" value={vendorBeingEdited.address} onChange={(e) => handleEditChange('address', e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowEditModal(false); setVendorBeingEdited(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vendors;
