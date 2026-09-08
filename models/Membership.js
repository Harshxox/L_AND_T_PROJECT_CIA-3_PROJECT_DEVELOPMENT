const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MembershipPlan',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING', 'FROZEN'],
    default: 'ACTIVE'
  },
  isFrozen: {
    type: Boolean,
    default: false
  },
  freezeStartDate: {
    type: Date
  },
  freezeEndDate: {
    type: Date
  },
  paymentDetails: {
    transactionId: String,
    receiptNumber: String,
    amountPaid: Number,
    paymentMethod: { type: String, default: 'DUMMY_CARD' },
    discountApplied: { type: Number, default: 0 },
    couponCode: String
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  renewalCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Membership', membershipSchema);

