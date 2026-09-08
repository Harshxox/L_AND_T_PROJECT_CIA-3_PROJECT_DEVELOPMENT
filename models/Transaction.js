const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemType: {
    type: String,
    enum: ['MEMBERSHIP_PLAN', 'PT_PACKAGE', 'DAY_PASS'],
    default: 'MEMBERSHIP_PLAN'
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MembershipPlan'
  },
  itemName: {
    type: String,
    required: true
  },
  originalAmount: {
    type: Number,
    required: true
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  couponCode: {
    type: String,
    default: ''
  },
  paymentMethod: {
    type: String,
    enum: ['DUMMY_CARD', 'DUMMY_UPI', 'DUMMY_NETBANKING', 'CASH'],
    default: 'DUMMY_CARD'
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'REFUNDED'],
    default: 'SUCCESS'
  },
  paymentGatewayRef: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
