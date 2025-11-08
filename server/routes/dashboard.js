const express = require('express');
const Event = require('../models/Event');
const Client = require('../models/Client');
const Vendor = require('../models/Vendor');
const Payment = require('../models/Payment');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Build base filter based on user role
    let baseFilter = {};
    if (req.user.role === 'client') {
      baseFilter.client = req.user.id;
    } else if (req.user.role === 'staff') {
      baseFilter.organizer = req.user.id;
    }

    // Get event statistics
    const totalEvents = await Event.countDocuments(baseFilter);
    const activeEvents = await Event.countDocuments({ ...baseFilter, status: 'published' });
    const completedEvents = await Event.countDocuments({ ...baseFilter, status: 'completed' });
    const upcomingEvents = await Event.countDocuments({ 
      ...baseFilter, 
      startDate: { $gte: now },
      status: 'published'
    });

    // Get client statistics
    const totalClients = await Client.countDocuments();
    const activeClients = await Client.countDocuments({ status: 'active' });

    // Get vendor statistics
    const totalVendors = await Vendor.countDocuments();
    const activeVendors = await Vendor.countDocuments({ status: 'active' });

    // Get payment statistics
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyRevenue = await Payment.aggregate([
      { 
        $match: { 
          status: 'completed',
          paymentDate: { $gte: startOfMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get recent events
    const recentEvents = await Event.find(baseFilter)
      .populate('client', 'companyName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get upcoming events
    const upcomingEventsList = await Event.find({
      ...baseFilter,
      startDate: { $gte: now },
      status: 'published'
    })
      .populate('client', 'companyName')
      .sort({ startDate: 1 })
      .limit(5);

    // Get monthly event trends
    const monthlyTrends = await Event.aggregate([
      {
        $match: {
          ...baseFilter,
          createdAt: { $gte: startOfYear }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      events: {
        total: totalEvents,
        active: activeEvents,
        completed: completedEvents,
        upcoming: upcomingEvents
      },
      clients: {
        total: totalClients,
        active: activeClients
      },
      vendors: {
        total: totalVendors,
        active: activeVendors
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        monthly: monthlyRevenue[0]?.total || 0
      },
      recentEvents,
      upcomingEvents: upcomingEventsList,
      monthlyTrends
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

