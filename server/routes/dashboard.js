const express = require('express');
const dashboardService = require('../services/dashboard.service');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await dashboardService.getStats(req.user);
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
