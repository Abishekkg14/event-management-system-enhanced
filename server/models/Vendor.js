const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [200, 'Business name cannot exceed 200 characters']
  },
  contactPerson: {
    firstName: {
      type: String,
      required: [true, 'Contact first name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Contact last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    position: {
      type: String,
      trim: true
    }
  },
  services: [{
    type: String,
    enum: ['catering', 'audio-visual', 'photography', 'videography', 'decorations', 'security', 'transportation', 'entertainment', 'florist', 'rental', 'other']
  }],
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  website: {
    type: String,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  },
  businessLicense: {
    type: String,
    trim: true
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    coverageAmount: Number
  },
  pricing: {
    hourly: Number,
    daily: Number,
    package: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  availability: {
    monday: { start: String, end: String, available: Boolean },
    tuesday: { start: String, end: String, available: Boolean },
    wednesday: { start: String, end: String, available: Boolean },
    thursday: { start: String, end: String, available: Boolean },
    friday: { start: String, end: String, available: Boolean },
    saturday: { start: String, end: String, available: Boolean },
    sunday: { start: String, end: String, available: Boolean }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending-approval', 'blacklisted'],
    default: 'pending-approval'
  },
  rating: {
    average: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  portfolio: [String], // URLs to portfolio images/videos
  certifications: [String],
  notes: {
    type: String,
    trim: true
  },
  tags: [String],
  totalEvents: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  lastEventDate: Date,
  documents: [String]
}, {
  timestamps: true
});

// Virtual for full contact name
vendorSchema.virtual('contactPerson.fullName').get(function() {
  return `${this.contactPerson.firstName} ${this.contactPerson.lastName}`;
});

// Index for better query performance
vendorSchema.index({ businessName: 1 });
vendorSchema.index({ services: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ 'rating.average': -1 });

module.exports = mongoose.model('Vendor', vendorSchema);

