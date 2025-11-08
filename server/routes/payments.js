const express = require('express');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Event = require('../models/Event');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/payments
// @desc    Get all payments with filtering
// @access  Private
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

// @route   POST /api/payments
// @desc    Create new payment
// @access  Private (Manager, Admin)
router.post('/', [auth, authorize('admin', 'manager')], [
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

    // Check if event exists
    const event = await Event.findById(req.body.event);
    if (!event) {
      return res.status(400).json({ message: 'Event not found' });
    }

    const paymentData = {
      ...req.body,
      processedBy: req.user.id
    };

    const payment = new Payment(paymentData);
    await payment.save();

    await payment.populate([
      { path: 'event', select: 'title startDate' },
      { path: 'client', select: 'companyName contactPerson' },
      { path: 'processedBy', select: 'firstName lastName' }
    ]);

    res.status(201).json({
      message: 'Payment created successfully',
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

