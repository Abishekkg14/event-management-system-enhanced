const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const Client = require('../models/Client');
const Vendor = require('../models/Vendor');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events with filtering and pagination
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      eventType,
      startDate,
      endDate,
      search,
      sortBy = 'startDate',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (eventType) filter.eventType = eventType;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.venue': { $regex: search, $options: 'i' } }
      ];
    }

    // Role-based filtering
    if (req.user.role === 'client') {
      filter.client = req.user.id;
    } else if (req.user.role === 'staff') {
      filter.organizer = req.user.id;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const events = await Event.find(filter)
      .populate('organizer', 'firstName lastName email')
      .populate('client', 'companyName contactPerson')
      .populate('vendors.vendor', 'businessName services')
      .populate('staff.user', 'firstName lastName email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(filter);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName email phone')
      .populate('client', 'companyName contactPerson address')
      .populate('vendors.vendor', 'businessName services contactPerson pricing')
      .populate('staff.user', 'firstName lastName email phone');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check access permissions
    if (req.user.role === 'client' && event.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private (Manager, Admin)
router.post('/', [auth, authorize('admin', 'manager')], [
  body('title').trim().notEmpty().withMessage('Event title is required'),
  body('description').trim().notEmpty().withMessage('Event description is required'),
  body('eventType').isIn(['conference', 'seminar', 'workshop', 'meeting', 'exhibition', 'trade-show', 'webinar', 'virtual', 'hybrid']).withMessage('Invalid event type'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('client').isMongoId().withMessage('Valid client ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if client exists
    const client = await Client.findById(req.body.client);
    if (!client) {
      return res.status(400).json({ message: 'Client not found' });
    }

    const eventData = {
      ...req.body,
      organizer: req.user.id
    };

    const event = new Event(eventData);
    await event.save();

    // Populate the created event
    await event.populate([
      { path: 'organizer', select: 'firstName lastName email' },
      { path: 'client', select: 'companyName contactPerson' }
    ]);

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Manager, Admin, or Event Organizer)
router.put('/:id', auth, [
  body('title').optional().trim().notEmpty().withMessage('Event title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Event description cannot be empty'),
  body('eventType').optional().isIn(['conference', 'seminar', 'workshop', 'meeting', 'exhibition', 'trade-show', 'webinar', 'virtual', 'hybrid']).withMessage('Invalid event type'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'manager' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'firstName lastName email')
     .populate('client', 'companyName contactPerson');

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Admin, Manager)
router.delete('/:id', [auth, authorize('admin', 'manager')], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/vendors
// @desc    Add vendor to event
// @access  Private (Manager, Admin)
router.post('/:id/vendors', [auth, authorize('admin', 'manager')], [
  body('vendor').isMongoId().withMessage('Valid vendor ID is required'),
  body('service').trim().notEmpty().withMessage('Service is required'),
  body('cost').isNumeric().withMessage('Cost must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if vendor exists
    const vendor = await Vendor.findById(req.body.vendor);
    if (!vendor) {
      return res.status(400).json({ message: 'Vendor not found' });
    }

    // Check if vendor is already added
    const existingVendor = event.vendors.find(v => v.vendor.toString() === req.body.vendor);
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor already added to this event' });
    }

    event.vendors.push({
      vendor: req.body.vendor,
      service: req.body.service,
      cost: req.body.cost
    });

    await event.save();
    await event.populate('vendors.vendor', 'businessName services');

    res.json({
      message: 'Vendor added successfully',
      event
    });
  } catch (error) {
    console.error('Add vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/staff
// @desc    Add staff to event
// @access  Private (Manager, Admin)
router.post('/:id/staff', [auth, authorize('admin', 'manager')], [
  body('user').isMongoId().withMessage('Valid user ID is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('responsibilities').isArray().withMessage('Responsibilities must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user exists
    const user = await User.findById(req.body.user);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if user is already assigned
    const existingStaff = event.staff.find(s => s.user.toString() === req.body.user);
    if (existingStaff) {
      return res.status(400).json({ message: 'User already assigned to this event' });
    }

    event.staff.push({
      user: req.body.user,
      role: req.body.role,
      responsibilities: req.body.responsibilities
    });

    await event.save();
    await event.populate('staff.user', 'firstName lastName email');

    res.json({
      message: 'Staff added successfully',
      event
    });
  } catch (error) {
    console.error('Add staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

