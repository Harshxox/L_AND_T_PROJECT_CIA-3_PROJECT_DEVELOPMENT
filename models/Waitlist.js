const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['WAITING', 'PROMOTED', 'CANCELLED'],
    default: 'WAITING'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Waitlist', waitlistSchema);
