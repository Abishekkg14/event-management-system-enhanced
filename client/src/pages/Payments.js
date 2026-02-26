import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, when: 'beforeChildren', staggerChildren: 0.05 } }
};

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const receiptRef = useRef(null);
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

  const mockPayments = [];

  useEffect(() => {
    fetchPayments();
    fetchEventsAndClients();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPayments = async () => {
    try {
      const response = await fetch(`${API}/api/payments`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
        setLoading(false);
        return;
      }
      throw new Error('API unavailable');
    } catch (error) {
      console.error('Error fetching payments:', error);
      setTimeout(() => {
        setPayments(mockPayments);
        setLoading(false);
      }, 1000);
    }
  };

  const fetchEventsAndClients = async () => {
    try {
      const [eventsRes, clientsRes] = await Promise.all([
        fetch(`${API}/api/events`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch(`${API}/api/clients`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      ]);
      if (eventsRes.ok && clientsRes.ok) {
        const eventsData = await eventsRes.json();
        const clientsData = await clientsRes.json();
        setEvents(eventsData.events || eventsData || []);
        setClients(clientsData.clients || clientsData || []);
        return;
      }
      throw new Error('API unavailable');
    } catch (error) {
      console.error('Error fetching events and clients:', error);
      setEvents([
        { _id: '1', title: 'Tech Conference 2023' },
        { _id: '2', title: 'Annual Charity Gala' },
        { _id: '3', title: 'Product Launch Event' }
      ]);
      setClients([
        { _id: '1', companyName: 'TechCorp Inc.' },
        { _id: '2', companyName: 'Hope Foundation' },
        { _id: '3', companyName: 'NextGen Devices' }
      ]);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newPayment)
      });

      if (response.ok) {
        const data = await response.json();
        setPayments([...payments, data.payment]);
        setShowAddModal(false);
        resetForm();
        alert('Payment recorded successfully!');
        return;
      }
      throw new Error('API unavailable');
    } catch (error) {
      console.error('Error adding payment:', error);

      const selectedEvent = events.find(ev => ev._id === newPayment.event);
      const selectedClient = clients.find(c => c._id === newPayment.client);

      alert(error.message || 'Error recording payment.');
    }
  };

  const updatePaymentStatus = async (paymentId, newStatus) => {
    try {
      const response = await fetch(`${API}/api/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(payments.map(p => p._id === paymentId ? data.payment : p));
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating status.');
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

  const viewReceipt = async (payment) => {
    setReceiptLoading(true);
    setShowReceiptModal(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API}/api/payments/${payment._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReceiptPayment(data.payment);
      } else {
        setReceiptPayment(payment);
      }
    } catch {
      setReceiptPayment(payment);
    } finally {
      setReceiptLoading(false);
    }
  };

  const printReceipt = () => {
    const content = receiptRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${receiptPayment?.receiptNumber || receiptPayment?.invoiceNumber || 'N/A'}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a2e; background: #fff; padding: 40px; }
          .receipt-container { max-width: 700px; margin: 0 auto; }
          .receipt-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #4361ee; }
          .company-name { font-size: 28px; font-weight: 700; color: #4361ee; }
          .company-subtitle { font-size: 13px; color: #6c757d; margin-top: 4px; }
          .receipt-title { text-align: right; }
          .receipt-title h2 { font-size: 24px; color: #1a1a2e; text-transform: uppercase; letter-spacing: 2px; }
          .receipt-title .receipt-number { font-size: 14px; color: #6c757d; margin-top: 4px; }
          .receipt-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-block h4 { font-size: 11px; text-transform: uppercase; color: #6c757d; letter-spacing: 1px; margin-bottom: 8px; }
          .info-block p { font-size: 14px; line-height: 1.6; color: #333; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .items-table th { background: #f0f3ff; color: #4361ee; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 12px 16px; text-align: left; border-bottom: 2px solid #4361ee; }
          .items-table td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #e9ecef; }
          .items-table .text-right { text-align: right; }
          .totals { margin-left: auto; width: 280px; }
          .totals .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .totals .row.total { border-top: 2px solid #4361ee; font-size: 18px; font-weight: 700; color: #4361ee; padding-top: 12px; margin-top: 4px; }
          .status-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          .status-completed { background: #d4edda; color: #155724; }
          .status-pending { background: #fff3cd; color: #856404; }
          .status-failed, .status-cancelled { background: #f8d7da; color: #721c24; }
          .receipt-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center; font-size: 12px; color: #6c757d; }
          .receipt-footer p { margin-bottom: 4px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 400);
  };

  const downloadReceiptPDF = () => {
    printReceipt();
  };

  const formatPaymentMethod = (method) => {
    const methods = {
      'credit-card': 'Credit Card',
      'bank-transfer': 'Bank Transfer',
      'check': 'Check',
      'cash': 'Cash',
      'paypal': 'PayPal',
      'stripe': 'Stripe',
      'other': 'Other'
    };
    return methods[method] || method;
  };

  const formatPaymentType = (type) => {
    const types = {
      'deposit': 'Deposit',
      'partial': 'Partial Payment',
      'full': 'Full Payment',
      'refund': 'Refund',
      'adjustment': 'Adjustment'
    };
    return types[type] || type;
  };

  const handleStatusFilter = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange({ ...dateRange, [name]: value });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'failed':
      case 'overdue':
        return 'bg-danger';
      case 'cancelled':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'completed': return 'Completed';
      case 'partial': return 'Partially Paid';
      case 'pending': return 'Pending';
      case 'overdue': return 'Overdue';
      case 'failed': return 'Failed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const eventName = payment.event?.title || payment.eventName || '';
    const clientName = payment.client?.companyName || payment.clientName || '';
    const searchId = payment.invoiceNumber || payment._id || '';

    const matchesSearch = eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      searchId.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDate = true;
    const paymentDate = payment.paymentDate || payment.lastPaymentDate;

    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59);

      if (paymentDate) {
        matchesDate = new Date(paymentDate) >= startDate && new Date(paymentDate) <= endDate;
      } else {
        matchesDate = false;
      }
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPaid = filteredPayments.reduce((sum, payment) => sum + ((payment.status === 'paid' || payment.status === 'completed' || payment.paymentType === 'full') ? payment.amount : 0), 0);
  const totalBalance = totalAmount - totalPaid;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Payments</h2>
        <div>
          <button
            className="btn btn-primary shadow-sm"
            onClick={() => setShowAddModal(true)}
          >
            <i className="bi bi-plus-lg me-1"></i> Record New Payment
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-12">
          <div className="premium-card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 text-center">
                  <h5 className="text-muted mb-1">Total Amount</h5>
                  <h3 className="mb-0">${(totalAmount || 0).toLocaleString()}</h3>
                </div>
                <div className="col-md-3 text-center">
                  <h5 className="text-muted mb-1">Total Paid</h5>
                  <h3 className="text-success mb-0">${(totalPaid || 0).toLocaleString()}</h3>
                </div>
                <div className="col-md-3 text-center">
                  <h5 className="text-muted mb-1">Total Balance</h5>
                  <h3 className="text-danger mb-0">${(totalBalance || 0).toLocaleString()}</h3>
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
          <div className="input-group shadow-sm border-subtle border rounded">
            <input
              type="text"
              className="form-control border-0"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="btn border-0 text-secondary" type="button" style={{ background: 'var(--bg-web)' }}>
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select shadow-sm"
            style={{ border: '1px solid var(--border-color)' }}
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
                className="form-control shadow-sm"
                style={{ border: '1px solid var(--border-color)' }}
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                placeholder="Start Date"
              />
            </div>
            <div className="col-md-6">
              <input
                type="date"
                className="form-control shadow-sm"
                style={{ border: '1px solid var(--border-color)' }}
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
                  <th>Invoice ID</th>
                  <th>Event</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Last Payment</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {filteredPayments.map((payment, index) => {
                  const isPaid = payment.status === 'completed' || payment.status === 'paid';
                  const paidAmount = isPaid ? payment.amount : 0;
                  const balanceAmount = payment.amount - paidAmount;

                  return (
                    <motion.tr
                      key={payment._id || payment.id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="fw-medium text-dark">{payment.invoiceNumber || 'N/A'}</td>
                      <td>
                        <Link to={`/events/${payment.event?._id || payment.eventId}`} className="text-decoration-none fw-semibold">
                          {payment.event?.title || payment.eventName}
                        </Link>
                      </td>
                      <td className="text-secondary">{payment.client?.companyName || payment.clientName}</td>
                      <td className="text-dark fw-semibold">${(payment.amount || 0).toLocaleString()}</td>
                      <td className="text-success fw-semibold">${(paidAmount).toLocaleString()}</td>
                      <td className="text-danger fw-semibold">${(balanceAmount).toLocaleString()}</td>
                      <td className="text-secondary">{payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <span className={`badge border ${getStatusBadge(payment.status)} bg-opacity-10 text-${getStatusBadge(payment.status).replace('bg-', '')} border-${getStatusBadge(payment.status).replace('bg-', '')} border-opacity-25`}>
                          {getStatusLabel(payment.status)}
                        </span>
                      </td>
                      <td className="text-secondary">{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : (payment.lastPaymentDate || 'N/A')}</td>
                      <td>
                        <div className="d-flex gap-2 justify-content-end">
                          {!isPaid && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              title="Complete Payment"
                              onClick={() => updatePaymentStatus(payment._id, 'completed')}
                            >
                              <i className="bi bi-check-circle"></i>
                            </button>
                          )}
                          <button className="btn btn-sm btn-outline-info" title="View Receipt" onClick={() => viewReceipt(payment)}>
                            <i className="bi bi-receipt"></i>
                          </button>
                          {payment.status !== 'cancelled' && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Cancel Payment"
                              onClick={() => updatePaymentStatus(payment._id, 'cancelled')}
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {filteredPayments.length === 0 && !loading && (
              <div className="card-body text-center p-5">
                <i className="bi bi-credit-card text-secondary mb-3" style={{ fontSize: '3rem' }}></i>
                <h5 className="text-dark">No payments found matching your criteria.</h5>
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
                <h5 className="modal-title fw-bold text-dark">Record New Payment</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddPayment}>
                <div className="modal-body px-4 py-4">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-medium text-secondary">Event *</label>
                      <select
                        className="form-select bg-white"
                        value={newPayment.event}
                        onChange={(e) => setNewPayment({ ...newPayment, event: e.target.value })}
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
                        onChange={(e) => setNewPayment({ ...newPayment, client: e.target.value })}
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
                        onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Payment Type *</label>
                      <select
                        className="form-select"
                        value={newPayment.paymentType}
                        onChange={(e) => setNewPayment({ ...newPayment, paymentType: e.target.value })}
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
                        onChange={(e) => setNewPayment({ ...newPayment, paymentMethod: e.target.value })}
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
                        onChange={(e) => setNewPayment({ ...newPayment, dueDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium text-secondary">Description</label>
                    <textarea
                      className="form-control bg-white"
                      rows="3"
                      value={newPayment.description}
                      onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                      placeholder="Additional payment details..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer bg-light px-4 py-3 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4">
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 30, 58, 0.55)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content shadow-lg border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-header px-4 py-3" style={{ background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)', border: 'none' }}>
                <h5 className="modal-title fw-bold text-white">
                  <i className="bi bi-receipt-cutoff me-2"></i>Payment Receipt
                </h5>
                <div className="d-flex gap-2 align-items-center">
                  <button className="btn btn-sm btn-light" onClick={printReceipt} title="Print Receipt">
                    <i className="bi bi-printer me-1"></i> Print
                  </button>
                  <button className="btn btn-sm btn-outline-light" onClick={downloadReceiptPDF} title="Download PDF">
                    <i className="bi bi-download me-1"></i> Save
                  </button>
                  <button type="button" className="btn-close btn-close-white ms-2" onClick={() => { setShowReceiptModal(false); setReceiptPayment(null); }}></button>
                </div>
              </div>
              <div className="modal-body p-4" style={{ background: '#f8f9fa' }}>
                {receiptLoading ? (
                  <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : receiptPayment ? (
                  <div ref={receiptRef}>
                    <div className="receipt-container" style={{ maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 12, padding: '36px 40px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, paddingBottom: 20, borderBottom: '3px solid #4361ee' }}>
                        <div>
                          <div style={{ fontSize: 28, fontWeight: 700, color: '#4361ee', letterSpacing: '-0.5px' }}>EventPro</div>
                          <div style={{ fontSize: 13, color: '#6c757d', marginTop: 4 }}>Event Management System</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <h2 style={{ fontSize: 22, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 0 }}>Receipt</h2>
                          <div style={{ fontSize: 14, color: '#6c757d', marginTop: 4 }}>
                            {receiptPayment.receiptNumber || receiptPayment.invoiceNumber || `RCP-${receiptPayment._id?.slice(-8).toUpperCase()}`}
                          </div>
                        </div>
                      </div>

                      {/* Info Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30, flexWrap: 'wrap', gap: 16 }}>
                        <div style={{ flex: 1, minWidth: 180 }}>
                          <h4 style={{ fontSize: 11, textTransform: 'uppercase', color: '#6c757d', letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>Billed To</h4>
                          <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', marginBottom: 2 }}>
                            {receiptPayment.client?.companyName || 'N/A'}
                          </p>
                          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, margin: 0 }}>
                            {receiptPayment.client?.contactPerson ? `${receiptPayment.client.contactPerson.firstName || ''} ${receiptPayment.client.contactPerson.lastName || ''}`.trim() : ''}
                            {receiptPayment.client?.contactPerson?.email && (
                              <><br />{receiptPayment.client.contactPerson.email}</>
                            )}
                            {receiptPayment.client?.contactPerson?.phone && (
                              <><br />{receiptPayment.client.contactPerson.phone}</>
                            )}
                          </p>
                        </div>
                        <div style={{ flex: 1, minWidth: 180 }}>
                          <h4 style={{ fontSize: 11, textTransform: 'uppercase', color: '#6c757d', letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>Payment Details</h4>
                          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8, margin: 0 }}>
                            <strong>Date:</strong> {receiptPayment.paymentDate ? new Date(receiptPayment.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                            <br />
                            <strong>Method:</strong> {formatPaymentMethod(receiptPayment.paymentMethod)}
                            <br />
                            <strong>Type:</strong> {formatPaymentType(receiptPayment.paymentType)}
                            <br />
                            <strong>Status:</strong>{' '}
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 12px',
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              background: receiptPayment.status === 'completed' ? '#d4edda' : receiptPayment.status === 'pending' ? '#fff3cd' : '#f8d7da',
                              color: receiptPayment.status === 'completed' ? '#155724' : receiptPayment.status === 'pending' ? '#856404' : '#721c24'
                            }}>
                              {receiptPayment.status?.toUpperCase()}
                            </span>
                          </p>
                        </div>
                        <div style={{ flex: 1, minWidth: 180 }}>
                          <h4 style={{ fontSize: 11, textTransform: 'uppercase', color: '#6c757d', letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>Invoice No.</h4>
                          <p style={{ fontSize: 15, fontWeight: 600, color: '#4361ee', margin: 0 }}>
                            {receiptPayment.invoiceNumber || `INV-${receiptPayment._id?.slice(-8).toUpperCase()}`}
                          </p>
                          {receiptPayment.dueDate && (
                            <p style={{ fontSize: 13, color: '#555', marginTop: 4, margin: 0 }}>
                              <strong>Due:</strong> {new Date(receiptPayment.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Items Table */}
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
                        <thead>
                          <tr>
                            <th style={{ background: '#f0f3ff', color: '#4361ee', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #4361ee' }}>Description</th>
                            <th style={{ background: '#f0f3ff', color: '#4361ee', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #4361ee' }}>Event</th>
                            <th style={{ background: '#f0f3ff', color: '#4361ee', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, padding: '12px 16px', textAlign: 'right', borderBottom: '2px solid #4361ee' }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid #e9ecef' }}>
                              {receiptPayment.description || `${formatPaymentType(receiptPayment.paymentType)} for event services`}
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid #e9ecef', color: '#555' }}>
                              {receiptPayment.event?.title || 'N/A'}
                              {receiptPayment.event?.startDate && (
                                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                                  {new Date(receiptPayment.event.startDate).toLocaleDateString()}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: 14, borderBottom: '1px solid #e9ecef', textAlign: 'right', fontWeight: 600 }}>
                              ${(receiptPayment.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Totals */}
                      <div style={{ marginLeft: 'auto', width: 280 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, color: '#555' }}>
                          <span>Subtotal</span>
                          <span>${(receiptPayment.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {receiptPayment.fees?.processingFee > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, color: '#555' }}>
                            <span>Processing Fee</span>
                            <span>${(receiptPayment.fees.processingFee).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        {receiptPayment.fees?.taxAmount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, color: '#555' }}>
                            <span>Tax</span>
                            <span>${(receiptPayment.fees.taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 8px', fontSize: 20, fontWeight: 700, color: '#4361ee', borderTop: '2px solid #4361ee', marginTop: 4 }}>
                          <span>Total</span>
                          <span>${((receiptPayment.amount || 0) + (receiptPayment.fees?.totalFees || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      {/* Processed By */}
                      {receiptPayment.processedBy && (
                        <div style={{ marginTop: 24, padding: '12px 16px', background: '#f8f9fa', borderRadius: 8, fontSize: 13, color: '#6c757d' }}>
                          <strong>Processed by:</strong> {receiptPayment.processedBy.firstName} {receiptPayment.processedBy.lastName}
                          {receiptPayment.processedBy.email && ` (${receiptPayment.processedBy.email})`}
                        </div>
                      )}

                      {/* Notes */}
                      {receiptPayment.notes && (
                        <div style={{ marginTop: 12, padding: '12px 16px', background: '#fff8e1', borderRadius: 8, fontSize: 13, color: '#856404' }}>
                          <strong>Notes:</strong> {receiptPayment.notes}
                        </div>
                      )}

                      {/* Footer */}
                      <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #e9ecef', textAlign: 'center', fontSize: 12, color: '#6c757d' }}>
                        <p style={{ marginBottom: 4 }}>Thank you for your payment!</p>
                        <p style={{ marginBottom: 4 }}>This receipt was generated by EventPro Event Management System</p>
                        <p style={{ marginBottom: 0 }}>For questions, contact support@eventpro.com</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-exclamation-circle text-danger" style={{ fontSize: '3rem' }}></i>
                    <p className="mt-3 text-muted">Unable to load receipt data.</p>
                  </div>
                )}
              </div>
              <div className="modal-footer bg-light px-4 py-3 border-top">
                <button className="btn btn-outline-secondary" onClick={() => { setShowReceiptModal(false); setReceiptPayment(null); }}>Close</button>
                <button className="btn btn-primary px-4" onClick={printReceipt}>
                  <i className="bi bi-printer me-1"></i> Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default Payments;
