const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'negotiating', 'accepted', 'rejected', 'expired'],
        default: 'draft'
    },
    terms: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    validUntil: {
        type: Date
    }
}, {
    timestamps: true
});

contractSchema.index({ vendorId: 1, eventId: 1 });
contractSchema.index({ organizationId: 1, status: 1 });

module.exports = mongoose.model('Contract', contractSchema);
