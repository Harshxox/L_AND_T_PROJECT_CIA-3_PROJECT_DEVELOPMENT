const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedMembershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membership'
  },
  milestone: {
    type: String // To prevent duplicate expiry notifications (e.g., '7_DAYS', '3_DAYS', '1_DAY')
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
