const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
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
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  industry: {
    type: String,
    trim: true
  },
  companySize: {
    type: String,
    enum: ['startup', 'small', 'medium', 'large', 'enterprise']
  },
  website: {
    type: String,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  },
  billingInfo: {
    billingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    paymentTerms: {
      type: String,
      enum: ['net-15', 'net-30', 'net-60', 'due-on-receipt'],
      default: 'net-30'
    },
    preferredPaymentMethod: {
      type: String,
      enum: ['credit-card', 'bank-transfer', 'check', 'paypal'],
      default: 'credit-card'
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect', 'blacklisted'],
    default: 'prospect'
  },
  notes: {
    type: String,
    trim: true
  },
  tags: [String],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  totalEvents: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  lastEventDate: Date,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  documents: [String]
}, {
  timestamps: true
});

// Virtual for full contact name
clientSchema.virtual('contactPerson.fullName').get(function() {
  return `${this.contactPerson.firstName} ${this.contactPerson.lastName}`;
});

// Index for better query performance
clientSchema.index({ companyName: 1 });
clientSchema.index({ 'contactPerson.email': 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Client', clientSchema);

