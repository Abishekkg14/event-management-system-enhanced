const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
        default: 'pending'
    },
    ticketType: {
        type: String,
        enum: ['general', 'vip', 'early_bird'],
        default: 'general'
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    bookingDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

bookingSchema.index({ eventId: 1, organizationId: 1, bookingDate: 1 });
bookingSchema.index({ userId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
