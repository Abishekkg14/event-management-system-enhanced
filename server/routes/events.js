const express = require('express');
const { body, validationResult } = require('express-validator');
const eventService = require('../services/event.service');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const result = await eventService.getEvents(req.query, req.user);
    res.json(result);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id, req.user);
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
});

router.post('/', [auth, authorize('Super Admin', 'Admin', 'Organizer')], [
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

    const event = await eventService.createEvent(req.body, req.user);
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
});

router.put('/:id', [auth, authorize('Super Admin', 'Admin', 'Organizer')], [
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

    const event = await eventService.updateEvent(req.params.id, req.body, req.user);
    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
});

router.delete('/:id', [auth, authorize('Super Admin', 'Admin', 'Organizer')], async (req, res) => {
  try {
    const result = await eventService.deleteEvent(req.params.id, req.user);
    res.json(result);
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
});

router.patch('/:id/status', [auth, authorize('Super Admin', 'Admin', 'Organizer')], [
  body('status').isIn(['draft', 'published', 'cancelled', 'completed']).withMessage('Invalid status value')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await eventService.updateEvent(req.params.id, { status: req.body.status }, req.user);
    res.json({ message: 'Event status updated successfully', event });
  } catch (error) {
    console.error('Update event status error:', error);
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
});

router.post('/:id/vendors', [auth, authorize('Super Admin', 'Admin', 'Organizer')], [
  body('vendor').isMongoId().withMessage('Valid vendor ID is required'),
  body('service').trim().notEmpty().withMessage('Service is required'),
  body('cost').isNumeric().withMessage('Cost must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await eventService.addVendor(req.params.id, req.body, req.user);
    res.json({ message: 'Vendor added successfully', event });
  } catch (error) {
    console.error('Add vendor error:', error);
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
});

router.post('/:id/staff', [auth, authorize('Super Admin', 'Admin', 'Organizer')], [
  body('user').isMongoId().withMessage('Valid user ID is required'),
  body('role').trim().notEmpty().withMessage('Role is required'),
  body('responsibilities').isArray().withMessage('Responsibilities must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await eventService.addStaff(req.params.id, req.body, req.user);
    res.json({ message: 'Staff added successfully', event });
  } catch (error) {
    console.error('Add staff error:', error);
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
