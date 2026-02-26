import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const rowVariant = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

function getDeptBadgeClass(department) {
  const map = {
    Management: 'badge bg-primary',
    Operations: 'badge bg-success',
    Sales: 'badge bg-warning text-dark',
    Technical: 'badge bg-info text-dark',
    Marketing: 'badge bg-secondary',
    Planning: 'badge bg-primary',
    'Food Services': 'badge bg-success',
    Finance: 'badge bg-danger'
  };
  return map[department] || 'badge bg-secondary';
}

function getRoleBadgeClass(role) {
  const map = {
    admin: 'badge bg-danger',
    manager: 'badge bg-warning text-dark',
    staff: 'badge bg-info text-dark'
  };
  return map[role] || 'badge bg-secondary';
}

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
    role: 'Organizer',
    phone: ''
  });

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

      const response = await fetch(`${API}/api/staff`, {
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
        setStaffMembers(mockStaffMembers);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching staff:', error);
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

      const response = await fetch(`${API}/api/staff`, {
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
    setNewStaff({ firstName: '', lastName: '', email: '', password: '', role: 'Organizer', phone: '' });
  };

  const handleRoleFilter = (e) => { setFilterRole(e.target.value); };
  const handleSearch = (e) => { setSearchTerm(e.target.value); };

  const handleDeleteStaff = (id) => {
    if (!window.confirm('Remove this staff member?')) return;
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
    <motion.div initial="hidden" animate="visible" variants={fadeIn}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Staff</h2>
        <button className="btn btn-primary shadow-sm" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-plus-lg me-1"></i> Add Staff
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group shadow-sm border-subtle border rounded">
            <input type="text" className="form-control border-0" placeholder="Search staff..." value={searchTerm} onChange={handleSearch} />
            <button className="btn border-0 text-secondary" type="button" style={{ background: 'var(--bg-web)' }}><i className="bi bi-search"></i></button>
          </div>
        </div>
        <div className="col-md-6">
          <select className="form-select shadow-sm" style={{ border: '1px solid var(--border-color)' }} value={filterRole} onChange={handleRoleFilter}>
            {departments.map((department, index) => (
              <option key={index} value={department}>{department === 'all' ? 'All Departments' : department}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="premium-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Events</th>
                  <th>Service</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <motion.tbody variants={staggerContainer} initial="hidden" animate="visible" className="border-top-0">
                {filteredStaffMembers.map((staff) => (
                  <motion.tr key={staff.id} variants={rowVariant}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={staff.avatar}
                          alt={staff.name}
                          className="rounded-circle me-2 border border-2 border-white shadow-sm"
                          style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                        />
                        <span className="fw-semibold text-dark">{staff.name}</span>
                      </div>
                    </td>
                    <td><span className={getRoleBadgeClass(staff.role)}>{staff.role}</span></td>
                    <td><span className={getDeptBadgeClass(staff.department)}>{staff.department}</span></td>
                    <td><a href={`mailto:${staff.email}`} className="text-decoration-none">{staff.email}</a></td>
                    <td className="text-secondary">{staff.phone}</td>
                    <td className="fw-medium text-secondary">{staff.eventsManaged}</td>
                    <td className="text-secondary">{calculateServiceLength(staff.joinDate)}</td>
                    <td>
                      <div className="d-flex gap-2 justify-content-end">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEditStaff(staff)} title="Edit">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteStaff(staff.id)} title="Delete">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
            {filteredStaffMembers.length === 0 && !loading && (
              <div className="card-body text-center p-5">
                <i className="bi bi-person-badge text-secondary mb-3" style={{ fontSize: '3rem' }}></i>
                <h5 className="text-dark">No staff members found matching your criteria.</h5>
                <p className="text-muted">Try adjusting your search or filter settings.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 30, 58, 0.4)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-light border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold text-dark">Add New Staff Member</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddStaff}>
                <div className="modal-body px-4 py-4">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium text-secondary">First Name *</label>
                      <input
                        type="text"
                        className="form-control bg-white"
                        value={newStaff.firstName}
                        onChange={(e) => setNewStaff({ ...newStaff, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newStaff.lastName}
                        onChange={(e) => setNewStaff({ ...newStaff, lastName: e.target.value })}
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
                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={newStaff.phone}
                        onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Role *</label>
                      <select
                        className="form-select"
                        value={newStaff.role}
                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                        required
                      >
                        <option value="Admin">Admin</option>
                        <option value="Organizer">Organizer</option>
                        <option value="Vendor">Vendor</option>
                        <option value="Client">Client</option>
                        <option value="Attendee">Attendee</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        value={newStaff.password}
                        onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                        minLength="6"
                        required
                      />
                      <div className="form-text">Password must be at least 6 characters</div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light px-4 py-3 border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Add Staff Member</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && staffBeingEdited && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 30, 58, 0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-light border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold text-dark">Edit Staff</h5>
                <button type="button" className="btn-close" onClick={() => { setShowEditModal(false); setStaffBeingEdited(null); }}></button>
              </div>
              <form onSubmit={handleSaveStaff}>
                <div className="modal-body px-4 py-4">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" value={staffBeingEdited.name} onChange={(e) => handleEditChange('name', e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <input type="text" className="form-control" value={staffBeingEdited.role} onChange={(e) => handleEditChange('role', e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={staffBeingEdited.email} onChange={(e) => handleEditChange('email', e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input type="tel" className="form-control" value={staffBeingEdited.phone} onChange={(e) => handleEditChange('phone', e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-control" value={staffBeingEdited.department} onChange={(e) => handleEditChange('department', e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer bg-light px-4 py-3 border-top">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => { setShowEditModal(false); setStaffBeingEdited(null); }}>Cancel</button>
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

export default Staff;
