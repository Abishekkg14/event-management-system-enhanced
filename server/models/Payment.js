const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  paymentType: {
    type: String,
    enum: ['deposit', 'partial', 'full', 'refund', 'adjustment'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['credit-card', 'bank-transfer', 'check', 'cash', 'paypal', 'stripe', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  dueDate: Date,
  description: {
    type: String,
    trim: true
  },
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  fees: {
    processingFee: {
      type: Number,
      default: 0
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    totalFees: {
      type: Number,
      default: 0
    }
  },
  notes: {
    type: String,
    trim: true
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  refundInfo: {
    refundAmount: Number,
    refundDate: Date,
    refundReason: String,
    refundMethod: String
  },
  attachments: [String]
}, {
  timestamps: true
});

paymentSchema.virtual('netAmount').get(function () {
  return this.amount - this.fees.totalFees;
});

paymentSchema.index({ organizationId: 1, event: 1 });
paymentSchema.index({ event: 1 });
paymentSchema.index({ client: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

