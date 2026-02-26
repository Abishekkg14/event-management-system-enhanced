const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Event title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true
  },
  eventType: {
    type: String,
    enum: ['conference', 'seminar', 'workshop', 'meeting', 'exhibition', 'trade-show', 'webinar', 'virtual', 'hybrid'],
    required: [true, 'Event type is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  location: {
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
      lat: Number,
      lng: Number
    }
  },
  capacity: {
    type: Number,
    required: [true, 'Event capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  currentRegistrations: {
    type: Number,
    default: 0
  },
  pricing: {
    earlyBird: {
      amount: Number,
      endDate: Date
    },
    regular: {
      amount: Number
    },
    vip: {
      amount: Number
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  vendors: [{
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    service: String,
    cost: Number,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    }
  }],
  staff: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    responsibilities: [String]
  }],
  budget: {
    total: Number,
    allocated: Number,
    spent: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  requirements: {
    catering: Boolean,
    audioVisual: Boolean,
    security: Boolean,
    transportation: Boolean,
    accommodation: Boolean,
    specialNeeds: [String]
  },
  tags: [String],
  images: [String],
  documents: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  registrationDeadline: Date,
  cancellationPolicy: String,
  refundPolicy: String
}, {
  timestamps: true
});

eventSchema.virtual('availableSpots').get(function () {
  return this.capacity - this.currentRegistrations;
});

eventSchema.virtual('registrationPercentage').get(function () {
  return Math.round((this.currentRegistrations / this.capacity) * 100);
});

eventSchema.index({ organizationId: 1, startDate: 1, status: 1 });
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ client: 1 });

module.exports = mongoose.model('Event', eventSchema);

