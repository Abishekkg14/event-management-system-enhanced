const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Organization name is required'],
        trim: true,
        maxlength: [100, 'Organization name cannot exceed 100 characters']
    },
    domain: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        sparse: true
    },
    settings: {
        theme: {
            primaryColor: String,
            logoUrl: String
        },
        currency: {
            type: String,
            default: 'USD'
        },
        timezone: {
            type: String,
            default: 'UTC'
        }
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'inactive'],
        default: 'active'
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'basic', 'pro', 'enterprise'],
            default: 'free'
        },
        status: {
            type: String,
            enum: ['active', 'past_due', 'canceled', 'unpaid'],
            default: 'active'
        },
        validUntil: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Organization', organizationSchema);
