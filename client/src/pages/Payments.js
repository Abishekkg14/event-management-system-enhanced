import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [newPayment, setNewPayment] = useState({
    event: '',
    client: '',
    amount: '',
    paymentType: 'partial',
    paymentMethod: 'credit-card',
    dueDate: '',
    description: ''
  });

  // Mock payment data
  const mockPayments = [
    {
      id: 'INV-2023-001',
      eventId: 1,
      eventName: 'Tech Conference 2023',
      clientName: 'TechCorp Inc.',
      amount: 45000,
      paid: 30000,
      balance: 15000,
      dueDate: '2023-09-30',
      status: 'partial',
      paymentMethod: 'Bank Transfer',
      lastPaymentDate: '2023-08-15'
    },
    {
      id: 'INV-2023-002',
      eventId: 2,
      eventName: 'Annual Charity Gala',
      clientName: 'Hope Foundation',
      amount: 35000,
      paid: 35000,
      balance: 0,
      dueDate: '2023-09-10',
      status: 'paid',
      paymentMethod: 'Credit Card',
      lastPaymentDate: '2023-09-05'
    },
    {
      id: 'INV-2023-003',
      eventId: 3,
      eventName: 'Product Launch Event',
      clientName: 'NextGen Devices',
      amount: 60000,
      paid: 60000,
      balance: 0,
      dueDate: '2023-07-25',
      status: 'paid',
      paymentMethod: 'Bank Transfer',
      lastPaymentDate: '2023-07-20'
    },
    {
      id: 'INV-2023-004',
      eventId: 4,
      eventName: 'Corporate Team Building',
      clientName: 'Global Finance Group',
      amount: 25000,
      paid: 0,
      balance: 25000,
      dueDate: '2023-10-15',
      status: 'pending',
      paymentMethod: 'Not Paid',
      lastPaymentDate: null
    },
    {
      id: 'INV-2023-005',
      eventId: 5,
      eventName: 'Industry Summit 2023',
      clientName: 'Industry Alliance',
      amount: 75000,
      paid: 25000,
      balance: 50000,
      dueDate: '2023-11-15',
      status: 'partial',
      paymentMethod: 'Bank Transfer',
      lastPaymentDate: '2023-08-30'
    },
    {
      id: 'INV-2023-006',
      eventId: 6,
      eventName: 'Holiday Party',
      clientName: 'Creative Studios',
      amount: 18000,
      paid: 0,
      balance: 18000,
      dueDate: '2023-11-25',
      status: 'overdue',
      paymentMethod: 'Not Paid',
      lastPaymentDate: null
    }
  ];

  useEffect(() => {
    fetchPayments();
    fetchEventsAndClients();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPayments = async () => {
    try {
      // For now, use mock data. In production, replace with:
      // const response = await fetch('/api/payments', {
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      // });
      // const data = await response.json();
      // setPayments(data.payments || []);
      
      setTimeout(() => {
        setPayments(mockPayments);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setLoading(false);
    }
  };

  const fetchEventsAndClients = async () => {
    try {
      // Mock data for events and clients
      const mockEvents = [
        { _id: '1', title: 'Tech Conference 2023' },
        { _id: '2', title: 'Annual Charity Gala' },
        { _id: '3', title: 'Product Launch Event' }
      ];
      const mockClients = [
        { _id: '1', companyName: 'TechCorp Inc.' },
        { _id: '2', companyName: 'Hope Foundation' },
        { _id: '3', companyName: 'NextGen Devices' }
      ];
      setEvents(mockEvents);
      setClients(mockClients);
    } catch (error) {
      console.error('Error fetching events and clients:', error);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      // For production, uncomment and use this API call:
      // const response = await fetch('/api/payments', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify(newPayment)
      // });
      // 
      // if (response.ok) {
      //   const data = await response.json();
      //   setPayments([...payments, data.payment]);
      //   setShowAddModal(false);
      //   resetForm();
      // }

      // Mock implementation for demo
      const selectedEvent = events.find(e => e._id === newPayment.event);
      const selectedClient = clients.find(c => c._id === newPayment.client);
      
      const mockNewPayment = {
        id: `INV-2023-${String(Date.now()).slice(-3)}`,
        eventId: newPayment.event,
        eventName: selectedEvent?.title || 'Unknown Event',
        clientName: selectedClient?.companyName || 'Unknown Client',
        amount: parseFloat(newPayment.amount),
        paid: newPayment.paymentType === 'full' ? parseFloat(newPayment.amount) : 0,
        balance: newPayment.paymentType === 'full' ? 0 : parseFloat(newPayment.amount),
        dueDate: newPayment.dueDate,
        status: newPayment.paymentType === 'full' ? 'paid' : 'pending',
        paymentMethod: newPayment.paymentMethod,
        lastPaymentDate: newPayment.paymentType === 'full' ? new Date().toISOString().split('T')[0] : null
      };
      
      setPayments([...payments, mockNewPayment]);
      setShowAddModal(false);
      resetForm();
      alert('Payment recorded successfully!');
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Error recording payment. Please try again.');
    }
  };

  const resetForm = () => {
    setNewPayment({
      event: '',
      client: '',
      amount: '',
      paymentType: 'partial',
      paymentMethod: 'credit-card',
      dueDate: '',
      description: ''
    });
  };

  const handleStatusFilter = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };

  // Filter payments based on status, search term, and date range
  const filteredPayments = payments.filter(payment => {
    // Status filter
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    // Search filter
    const matchesSearch = payment.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filter
    let matchesDate = true;
    const paymentDate = payment.lastPaymentDate ? new Date(payment.lastPaymentDate) : null;
    
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59); // Include the entire end day
      
      if (paymentDate) {
        matchesDate = paymentDate >= startDate && paymentDate <= endDate;
      } else {
        // If no payment date and filtering by date, exclude this record
        matchesDate = false;
      }
    }
    
    return matchesStatus && matchesSearch && matchesDate;
  });

  // Calculate total statistics
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPaid = filteredPayments.reduce((sum, payment) => sum + payment.paid, 0);
  const totalBalance = filteredPayments.reduce((sum, payment) => sum + payment.balance, 0);

  return (
    <div className="container-fluid">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Payments</h2>
          <div>
            <button 
              className="btn btn-success"
              onClick={() => setShowAddModal(true)}
            >
              <i className="bi bi-plus-lg"></i> Record New Payment
            </button>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 text-center">
                    <h5 className="text-muted mb-1">Total Amount</h5>
                    <h3 className="mb-0">${totalAmount.toLocaleString()}</h3>
                  </div>
                  <div className="col-md-3 text-center">
                    <h5 className="text-muted mb-1">Total Paid</h5>
                    <h3 className="text-success mb-0">${totalPaid.toLocaleString()}</h3>
                  </div>
                  <div className="col-md-3 text-center">
                    <h5 className="text-muted mb-1">Total Balance</h5>
                    <h3 className="text-danger mb-0">${totalBalance.toLocaleString()}</h3>
                  </div>
                  <div className="col-md-3 text-center">
                    <h5 className="text-muted mb-1">Payment Rate</h5>
                    <h3 className="text-primary mb-0">
                      {totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0}%
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-4">
            <div className="input-group">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search payments..." 
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className="btn btn-outline-secondary" type="button">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>
          <div className="col-md-3">
            <select 
              className="form-select" 
              value={filterStatus}
              onChange={handleStatusFilter}
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="partial">Partially Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="col-md-5">
            <div className="row">
              <div className="col-md-6">
                <input 
                  type="date" 
                  className="form-control"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  placeholder="Start Date"
                />
              </div>
              <div className="col-md-6">
                <input 
                  type="date" 
                  className="form-control"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Invoice ID</th>
                      <th>Event</th>
                      <th>Client</th>
                      <th>Amount</th>
                      <th>Paid</th>
                      <th>Balance</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Last Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.id}</td>
                        <td>
                          <Link to={`/events/${payment.eventId}`} className="text-decoration-none">
                            {payment.eventName}
                          </Link>
                        </td>
                        <td>{payment.clientName}</td>
                        <td>${payment.amount.toLocaleString()}</td>
                        <td className="text-success">${payment.paid.toLocaleString()}</td>
                        <td className="text-danger">${payment.balance.toLocaleString()}</td>
                        <td>{payment.dueDate}</td>
                        <td>
                          <span className={`badge ${
                            payment.status === 'paid' ? 'bg-success' : 
                            payment.status === 'partial' ? 'bg-warning' :
                            payment.status === 'overdue' ? 'bg-danger' : 'bg-secondary'
                          }`}>
                            {payment.status === 'paid' ? 'Paid' : 
                             payment.status === 'partial' ? 'Partially Paid' :
                             payment.status === 'overdue' ? 'Overdue' : 'Pending'}
                          </span>
                        </td>
                        <td>{payment.lastPaymentDate || 'N/A'}</td>
                        <td>
                          <div className="btn-group">
                            <button className="btn btn-sm btn-primary">
                              <i className="bi bi-cash"></i>
                            </button>
                            <button className="btn btn-sm btn-info">
                              <i className="bi bi-receipt"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-secondary">
                              <i className="bi bi-three-dots"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {filteredPayments.length === 0 && !loading && (
          <div className="text-center p-5">
            <h4>No payments found matching your criteria.</h4>
            <p>Try adjusting your search or filter settings.</p>
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Record New Payment</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddPayment}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Event *</label>
                      <select
                        className="form-select"
                        value={newPayment.event}
                        onChange={(e) => setNewPayment({...newPayment, event: e.target.value})}
                        required
                      >
                        <option value="">Select Event</option>
                        {events.map(event => (
                          <option key={event._id} value={event._id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Client *</label>
                      <select
                        className="form-select"
                        value={newPayment.client}
                        onChange={(e) => setNewPayment({...newPayment, client: e.target.value})}
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
                      <label className="form-label">Amount ($) *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        step="0.01"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Payment Type *</label>
                      <select
                        className="form-select"
                        value={newPayment.paymentType}
                        onChange={(e) => setNewPayment({...newPayment, paymentType: e.target.value})}
                        required
                      >
                        <option value="deposit">Deposit</option>
                        <option value="partial">Partial Payment</option>
                        <option value="full">Full Payment</option>
                        <option value="refund">Refund</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Payment Method *</label>
                      <select
                        className="form-select"
                        value={newPayment.paymentMethod}
                        onChange={(e) => setNewPayment({...newPayment, paymentMethod: e.target.value})}
                        required
                      >
                        <option value="credit-card">Credit Card</option>
                        <option value="bank-transfer">Bank Transfer</option>
                        <option value="check">Check</option>
                        <option value="cash">Cash</option>
                        <option value="paypal">PayPal</option>
                        <option value="stripe">Stripe</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Due Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newPayment.dueDate}
                        onChange={(e) => setNewPayment({...newPayment, dueDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newPayment.description}
                      onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                      placeholder="Additional payment details..."
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
                    Record Payment
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

export default Payments;
