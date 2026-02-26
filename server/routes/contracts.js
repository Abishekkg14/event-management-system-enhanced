const express = require('express');
const { body, validationResult } = require('express-validator');
const contractService = require('../services/contract.service');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, [
    body('vendorId').isMongoId().withMessage('Valid vendor ID is required'),
    body('eventId').isMongoId().withMessage('Valid event ID is required'),
    body('terms').notEmpty().withMessage('Terms are required'),
    body('amount').isNumeric().withMessage('Amount must be a number')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const contract = await contractService.createContract(req.body, req.user);
        res.status(201).json({ message: 'Contract created successfully', contract });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Server error' });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const contracts = await contractService.getContracts(req.query, req.user);
        res.json(contracts);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Server error' });
    }
});

router.put('/:id/status', auth, [
    body('status').isIn(['draft', 'sent', 'negotiating', 'accepted', 'rejected', 'expired'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const contract = await contractService.updateContractStatus(req.params.id, req.body.status, req.user);
        res.json({ message: 'Contract status updated', contract });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || 'Server error' });
    }
});

module.exports = router;
