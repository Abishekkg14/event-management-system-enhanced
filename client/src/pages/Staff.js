import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function Staff() {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [staffBeingEdited, setStaffBeingEdited] = useState(null);
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'staff',
    phone: ''
  });

  // Mock staff data
  const mockStaffMembers = [
    { id: 1, name: 'Emily Johnson', role: 'Event Manager', email: 'emily.j@eventco.com', phone: '(555) 123-4567', avatar: 'https://randomuser.me/api/portraits/women/32.jpg', department: 'Management', eventsManaged: 24, joinDate: '2018-05-12' },
    { id: 2, name: 'Michael Brown', role: 'Logistics Coordinator', email: 'michael.b@eventco.com', phone: '(555) 234-5678', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', department: 'Operations', eventsManaged: 18, joinDate: '2019-02-23' },
    { id: 3, name: 'Sarah Williams', role: 'Client Liaison', email: 'sarah.w@eventco.com', phone: '(555) 345-6789', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', department: 'Sales', eventsManaged: 31, joinDate: '2017-11-05' },
    { id: 4, name: 'Robert Davis', role: 'Technical Director', email: 'robert.d@eventco.com', phone: '(555) 456-7890', avatar: 'https://randomuser.me/api/portraits/men/22.jpg', department: 'Technical', eventsManaged: 27, joinDate: '2018-09-18' },
    { id: 5, name: 'Jennifer Miller', role: 'Marketing Specialist', email: 'jennifer.m@eventco.com', phone: '(555) 567-8901', avatar: 'https://randomuser.me/api/portraits/women/15.jpg', department: 'Marketing', eventsManaged: 0, joinDate: '2020-03-15' },
    { id: 6, name: 'David Wilson', role: 'Event Planner', email: 'david.w@eventco.com', phone: '(555) 678-9012', avatar: 'https://randomuser.me/api/portraits/men/36.jpg', department: 'Planning', eventsManaged: 22, joinDate: '2019-07-08' },
    { id: 7, name: 'Lisa Taylor', role: 'Catering Manager', email: 'lisa.t@eventco.com', phone: '(555) 789-0123', avatar: 'https://randomuser.me/api/portraits/women/8.jpg', department: 'Food Services', eventsManaged: 19, joinDate: '2020-01-12' },
    { id: 8, name: 'James Martinez', role: 'Finance Manager', email: 'james.m@eventco.com', phone: '(555) 890-1234', avatar: 'https://randomuser.me/api/portraits/men/58.jpg', department: 'Finance', eventsManaged: 0, joinDate: '2018-11-20' }
  ];

  const departments = ['all', ...new Set(mockStaffMembers.map(staff => staff.department))];

  useEffect(() => {
    fetchStaff();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/staff', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedStaff = data.staff.map(member => ({
          id: member._id,
          name: `${member.firstName} ${member.lastName}`,
          firstName: member.firstName,
          lastName: member.lastName,
          role: member.role,
          email: member.email,
          phone: member.phone || 'N/A',
          avatar: `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=0d6efd&color=fff`,
          department: member.role === 'admin' ? 'Management' : member.role === 'manager' ? 'Management' : 'Operations',
          eventsManaged: 0,
          joinDate: new Date(member.createdAt).toISOString().split('T')[0]
        }));
        setStaffMembers(formattedStaff);
      } else {
        console.error('Failed to fetch staff:', response.statusText);
        // Fallback to mock data
        setStaffMembers(mockStaffMembers);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching staff:', error);
      // Fallback to mock data
      setStaffMembers(mockStaffMembers);
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await fetch('http://localhost:5000/api/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStaff)
      });

      if (response.ok) {
        const data = await response.json();
        const formattedNewStaff = {
          id: data.user.id,
          name: `${data.user.firstName} ${data.user.lastName}`,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          role: data.user.role,
          email: data.user.email,
          phone: newStaff.phone || 'N/A',
          avatar: `https://ui-avatars.com/api/?name=${data.user.firstName}+${data.user.lastName}&background=0d6efd&color=fff`,
          department: data.user.role === 'admin' ? 'Management' : data.user.role === 'manager' ? 'Management' : 'Operations',
          eventsManaged: 0,
          joinDate: new Date().toISOString().split('T')[0]
        };
        setStaffMembers([...staffMembers, formattedNewStaff]);
        setShowAddModal(false);
        resetForm();
        alert('Staff member added successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error adding staff member');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('Error adding staff member. Please try again.');
    }
  };

  const resetForm = () => {
    setNewStaff({ firstName: '', lastName: '', email: '', password: '', role: 'staff', phone: '' });
  };

  const handleRoleFilter = (e) => { setFilterRole(e.target.value); };
  const handleSearch = (e) => { setSearchTerm(e.target.value); };

  const handleDeleteStaff = (id) => {
    if (!window.confirm('Remove this staff member?')) return;
    // For production, call DELETE /api/staff/:id
    setStaffMembers(staffMembers.filter(s => s.id !== id));
  };

  const openEditStaff = (staff) => {
    setStaffBeingEdited(staff);
    setShowEditModal(true);
  };

  const handleEditChange = (path, value) => {
    setStaffBeingEdited(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      if (path === 'name') updated.name = value;
      if (path === 'role') updated.role = value;
      if (path === 'email') updated.email = value;
      if (path === 'phone') updated.phone = value;
      if (path === 'department') updated.department = value;
      return updated;
    });
  };

  const handleSaveStaff = (e) => {
    e.preventDefault();
    if (!staffBeingEdited) return;
    // For production, call PUT /api/staff/:id
    setStaffMembers(staffMembers.map(s => s.id === staffBeingEdited.id ? staffBeingEdited : s));
    setShowEditModal(false);
    setStaffBeingEdited(null);
  };

  const filteredStaffMembers = staffMembers.filter(staff => {
    const matchesRole = filterRole === 'all' || staff.department === filterRole;
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || staff.role.toLowerCase().includes(searchTerm.toLowerCase()) || staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const calculateServiceLength = (joinDate) => {
    const start = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    let result = '';
    if (diffYears > 0) result += `${diffYears} year${diffYears > 1 ? 's' : ''}`;
    if (diffMonths > 0) result += result ? `, ${diffMonths} month${diffMonths > 1 ? 's' : ''}` : `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    return result || 'Less than a month';
  };

  return (
    <div className="container-fluid">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Staff</h2>
          <div>
            <button className="btn btn-success" onClick={() => setShowAddModal(true)}>
              <i className="bi bi-plus-lg"></i> Add New Staff Member
            </button>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <input type="text" className="form-control" placeholder="Search staff..." value={searchTerm} onChange={handleSearch} />
              <button className="btn btn-outline-secondary" type="button"><i className="bi bi-search"></i></button>
            </div>
          </div>
          <div className="col-md-6">
            <select className="form-select" value={filterRole} onChange={handleRoleFilter}>
              {departments.map((department, index) => (
                <option key={index} value={department}>{department === 'all' ? 'All Departments' : department}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>
        ) : (
          <div className="row">
            {filteredStaffMembers.map((staff) => (
              <div key={staff.id} className="col-md-3 mb-4">
                <div className="card h-100">
                  <img src={staff.avatar} className="card-img-top rounded-circle mx-auto mt-3" alt={staff.name} style={{ width: '120px', height: '120px', objectFit: 'cover' }} />
                  <div className="card-body text-center">
                    <h5 className="card-title">{staff.name}</h5>
                    <p className="card-text fw-bold">{staff.role}</p>
                    <span className="badge bg-info mb-3">{staff.department}</span>
                    <div className="card-text text-start">
                      <p><i className="bi bi-envelope me-2"></i><a href={`mailto:${staff.email}`}>{staff.email}</a></p>
                      <p><i className="bi bi-telephone me-2"></i><a href={`tel:${staff.phone}`}>{staff.phone}</a></p>
                      <p><i className="bi bi-calendar-event me-2"></i><span>{staff.eventsManaged} Events Managed</span></p>
                      <p><i className="bi bi-clock-history me-2"></i><span>Service: {calculateServiceLength(staff.joinDate)}</span></p>
                    </div>
                  </div>
                  <div className="card-footer bg-transparent d-flex justify-content-between">
                    <button className="btn btn-outline-primary flex-grow-1 me-2" onClick={() => openEditStaff(staff)}>
                      <i className="bi bi-pencil"></i> Edit
                    </button>
                    <button className="btn btn-outline-danger flex-grow-1" onClick={() => handleDeleteStaff(staff.id)}>
                      <i className="bi bi-trash"></i> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredStaffMembers.length === 0 && !loading && (
              <div className="text-center p-5"><h4>No staff members found matching your criteria.</h4><p>Try adjusting your search or filter settings.</p></div>
            )}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Add New Staff Member</h5><button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button></div>
              <form onSubmit={handleAddStaff}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newStaff.firstName}
                        onChange={(e) => setNewStaff({...newStaff, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newStaff.lastName}
                        onChange={(e) => setNewStaff({...newStaff, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={newStaff.phone}
                        onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Role *</label>
                      <select
                        className="form-select"
                        value={newStaff.role}
                        onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                        required
                      >
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={newStaff.password}
                        onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                        minLength="6"
                        required
                      />
                      <div className="form-text">Password must be at least 6 characters</div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add Staff Member</button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && staffBeingEdited && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Edit Staff</h5><button type="button" className="btn-close" onClick={() => { setShowEditModal(false); setStaffBeingEdited(null); }}></button></div>
              <form onSubmit={handleSaveStaff}>
                <div className="modal-body">
                  <div className="mb-3"><label className="form-label">Name</label><input type="text" className="form-control" value={staffBeingEdited.name} onChange={(e) => handleEditChange('name', e.target.value)} required /></div>
                  <div className="mb-3"><label className="form-label">Role</label><input type="text" className="form-control" value={staffBeingEdited.role} onChange={(e) => handleEditChange('role', e.target.value)} /></div>
                  <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" value={staffBeingEdited.email} onChange={(e) => handleEditChange('email', e.target.value)} /></div>
                  <div className="mb-3"><label className="form-label">Phone</label><input type="tel" className="form-control" value={staffBeingEdited.phone} onChange={(e) => handleEditChange('phone', e.target.value)} /></div>
                  <div className="mb-3"><label className="form-label">Department</label><input type="text" className="form-control" value={staffBeingEdited.department} onChange={(e) => handleEditChange('department', e.target.value)} /></div>
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => { setShowEditModal(false); setStaffBeingEdited(null); }}>Cancel</button><button type="submit" className="btn btn-primary">Save Changes</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Staff;
