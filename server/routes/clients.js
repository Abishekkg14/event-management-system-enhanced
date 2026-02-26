const express = require('express');
const { body, validationResult } = require('express-validator');
const Client = require('../models/Client');
const Organization = require('../models/Organization');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      industry,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    const filter = {};
    if (req.user.role !== 'Super Admin') {
      filter.organizationId = req.user.organizationId;
    }

    if (status) filter.status = status;
    if (industry) filter.industry = industry;
    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { 'contactPerson.firstName': { $regex: search, $options: 'i' } },
        { 'contactPerson.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const clients = await Client.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Client.countDocuments(filter);

    res.json({
      clients,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', [auth, authorize('Super Admin', 'Admin', 'Organizer')], [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('contactPerson.firstName').trim().notEmpty().withMessage('Contact first name is required'),
  body('contactPerson.lastName').trim().notEmpty().withMessage('Contact last name is required'),
  body('contactPerson.email').isEmail().withMessage('Valid contact email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.body.organizationId) {
      if (req.user.organizationId) {
        req.body.organizationId = req.user.organizationId;
      } else {
        const defaultOrg = await Organization.findOne({ status: 'active' }).sort({ createdAt: 1 });
        if (!defaultOrg) {
          return res.status(400).json({ message: 'No active organization found' });
        }
        req.body.organizationId = defaultOrg._id;
      }
    }

    const client = new Client(req.body);
    await client.save();

    res.status(201).json({ message: 'Client created successfully', client });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', [auth, authorize('Super Admin', 'Admin', 'Organizer')], async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      {
        _id: req.params.id,
        ...(req.user.role !== 'Super Admin' && { organizationId: req.user.organizationId })
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ message: 'Client not found or unauthorized' });
    }

    res.json({ message: 'Client updated successfully', client });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', [auth, authorize('Super Admin', 'Admin', 'Organizer')], async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      ...(req.user.role !== 'Super Admin' && { organizationId: req.user.organizationId })
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found or unauthorized' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
