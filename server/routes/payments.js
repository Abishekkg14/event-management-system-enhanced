const express = require('express');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Event = require('../models/Event');
const Organization = require('../models/Organization');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentType,
      startDate,
      endDate,
      search,
      sortBy = 'paymentDate',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (req.user.role !== 'Super Admin') {
      filter.organizationId = req.user.organizationId;
    }

    if (status) filter.status = status;
    if (paymentType) filter.paymentType = paymentType;
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const payments = await Payment.find(filter)
      .populate('event', 'title startDate')
      .populate('client', 'companyName contactPerson')
      .populate('processedBy', 'firstName lastName')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', [auth, authorize('Super Admin', 'Admin', 'Organizer')], [
  body('event').isMongoId().withMessage('Valid event ID is required'),
  body('client').isMongoId().withMessage('Valid client ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('paymentType').isIn(['deposit', 'partial', 'full', 'refund', 'adjustment']).withMessage('Invalid payment type'),
  body('paymentMethod').isIn(['credit-card', 'bank-transfer', 'check', 'cash', 'paypal', 'stripe', 'other']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.body.event);
    if (!event) {
      return res.status(400).json({ message: 'Event not found' });
    }

    const paymentData = { ...req.body, processedBy: req.user.id };
    if (!paymentData.organizationId) {
      if (req.user.organizationId) {
        paymentData.organizationId = req.user.organizationId;
      } else {
        const defaultOrg = await Organization.findOne({ status: 'active' }).sort({ createdAt: 1 });
        if (!defaultOrg) {
          return res.status(400).json({ message: 'No active organization found' });
        }
        paymentData.organizationId = defaultOrg._id;
      }
    }

    // Auto-generate invoiceNumber and receiptNumber
    const paymentCount = await Payment.countDocuments();
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seqNum = String(paymentCount + 1).padStart(5, '0');
    paymentData.invoiceNumber = `INV-${datePart}-${seqNum}`;
    paymentData.receiptNumber = `RCP-${datePart}-${seqNum}`;

    const payment = new Payment(paymentData);
    await payment.save();

    await payment.populate([
      { path: 'event', select: 'title startDate' },
      { path: 'client', select: 'companyName contactPerson' },
      { path: 'processedBy', select: 'firstName lastName' }
    ]);

    res.status(201).json({ message: 'Payment created successfully', payment });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single payment (for receipt)
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('event', 'title startDate endDate location')
      .populate('client', 'companyName contactPerson address')
      .populate('processedBy', 'firstName lastName email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (req.user.role !== 'Super Admin' && payment.organizationId.toString() !== req.user.organizationId?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Payment Status
router.put('/:id/status', [auth, authorize('Super Admin', 'Admin', 'Organizer')], [
  body('status').isIn(['pending', 'completed', 'cancelled', 'failed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    payment.status = req.body.status;
    if (req.body.status === 'completed' && !payment.paymentDate) {
      payment.paymentDate = new Date();
    }
    await payment.save();

    await payment.populate([
      { path: 'event', select: 'title startDate' },
      { path: 'client', select: 'companyName contactPerson' }
    ]);

    res.json({ message: 'Payment status updated', payment });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
