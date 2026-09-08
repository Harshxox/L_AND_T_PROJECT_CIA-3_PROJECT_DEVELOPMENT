const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer'
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingType: {
    type: String,
    enum: ['CLASS', 'PERSONAL_TRAINING'],
    default: 'CLASS'
  },
  date: {
    type: Date,
    default: Date.now
  },
  timeSlot: {
    type: String
  },
  status: {
    type: String,
    enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
    default: 'CONFIRMED'
  },
  notes: {
    type: String
  },
  bookedAt: {
    type: Date,
    default: Date.now
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);

