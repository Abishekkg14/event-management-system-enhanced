const mongoose = require('mongoose');

const checkinSchema = new mongoose.Schema({
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
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

checkinSchema.index({ eventId: 1, bookingId: 1 }, { unique: true });
checkinSchema.index({ organizationId: 1, eventId: 1 });

module.exports = mongoose.model('Checkin', checkinSchema);
