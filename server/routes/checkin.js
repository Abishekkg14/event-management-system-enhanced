const express = require('express');
const { body, validationResult } = require('express-validator');
const checkinService = require('../services/checkin.service');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, [
    body('eventId').isMongoId().withMessage('Valid event ID is required'),
    body('bookingId').isMongoId().withMessage('Valid booking ID is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const result = await checkinService.processCheckin(req.body, req.user);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Server error' });
    }
});

module.exports = router;
