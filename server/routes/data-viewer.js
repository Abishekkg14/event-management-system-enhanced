const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Client = require('../models/Client');
const Vendor = require('../models/Vendor');
const Event = require('../models/Event');
const Payment = require('../models/Payment');

router.get('/overview', async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      clients: await Client.countDocuments(),
      vendors: await Vendor.countDocuments(),
      events: await Event.countDocuments(),
      payments: await Payment.countDocuments()
    };

    res.json({ success: true, message: 'Database overview retrieved successfully', stats, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching overview', error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
});

router.get('/clients', async (req, res) => {
  try {
    const clients = await Client.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: clients.length, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching clients', error: error.message });
  }
});

router.get('/vendors', async (req, res) => {
  try {
    const vendors = await Vendor.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: vendors.length, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching vendors', error: error.message });
  }
});

router.get('/events', async (req, res) => {
  try {
    const events = await Event.find({})
      .populate('organizer', 'firstName lastName email')
      .populate('client', 'companyName contactPerson')
      .populate('vendors.vendor', 'businessName')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching events', error: error.message });
  }
});

router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('client', 'companyName')
      .populate('event', 'title')
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching payments', error: error.message });
  }
});

router.get('/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    let Model;

    switch (collection) {
      case 'users': Model = User; break;
      case 'clients': Model = Client; break;
      case 'vendors': Model = Vendor; break;
      case 'events': Model = Event; break;
      case 'payments': Model = Payment; break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid collection name' });
    }

    const record = await Model.findById(id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching record', error: error.message });
  }
});

module.exports = router;
