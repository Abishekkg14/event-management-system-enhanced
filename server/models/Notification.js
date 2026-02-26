const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error'],
        default: 'info'
    },
    readStatus: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

notificationSchema.index({ userId: 1, readStatus: 1 });
notificationSchema.index({ organizationId: 1, userId: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
