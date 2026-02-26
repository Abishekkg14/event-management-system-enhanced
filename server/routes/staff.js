const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', [auth, authorize('Super Admin', 'Admin', 'Organizer')], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isActive: true };
    if (req.user.role !== 'Super Admin') {
      filter.organizationId = req.user.organizationId;
    }
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const staff = await User.find(filter)
      .select('-password')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      staff,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', [auth, authorize('Super Admin', 'Admin')], [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['Admin', 'Organizer', 'Vendor', 'Client', 'Attendee']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const newUserData = { firstName, lastName, email, password, role, phone };
    if (req.body.organizationId) {
      newUserData.organizationId = req.body.organizationId;
    } else if (req.user.organizationId) {
      newUserData.organizationId = req.user.organizationId;
    } else {
      const defaultOrg = await Organization.findOne({ status: 'active' }).sort({ createdAt: 1 });
      if (!defaultOrg) {
        return res.status(400).json({ message: 'No active organization found' });
      }
      newUserData.organizationId = defaultOrg._id;
    }

    const user = new User(newUserData);
    await user.save();

    res.status(201).json({
      message: 'Staff member created successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
