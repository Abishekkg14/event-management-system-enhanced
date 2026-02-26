const express = require('express');
const { body, validationResult } = require('express-validator');
const Vendor = require('../models/Vendor');
const Organization = require('../models/Organization');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      services,
      search,
      sortBy = 'rating.average',
      sortOrder = 'desc'
    } = req.query;
    const filter = {};
    if (req.user.role !== 'Super Admin') {
      filter.organizationId = req.user.organizationId;
    }

    if (status) filter.status = status;
    if (services) filter.services = { $in: services.split(',') };
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { 'contactPerson.firstName': { $regex: search, $options: 'i' } },
        { 'contactPerson.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const vendors = await Vendor.find(filter)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Vendor.countDocuments(filter);

    res.json({
      vendors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', [auth, authorize('Super Admin', 'Admin', 'Organizer')], [
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('contactPerson.firstName').trim().notEmpty().withMessage('Contact first name is required'),
  body('contactPerson.lastName').trim().notEmpty().withMessage('Contact last name is required'),
  body('contactPerson.email').isEmail().withMessage('Valid contact email is required'),
  body('services').isArray().withMessage('Services must be an array')
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
        // Fallback: find default organization
        const defaultOrg = await Organization.findOne({ status: 'active' }).sort({ createdAt: 1 });
        if (!defaultOrg) {
          return res.status(400).json({ message: 'No active organization found' });
        }
        req.body.organizationId = defaultOrg._id;
      }
    }

    const vendor = new Vendor(req.body);
    await vendor.save();

    res.status(201).json({ message: 'Vendor created successfully', vendor });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
