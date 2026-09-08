const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['GYM_VISIT', 'CLASS'],
    required: true
  },
  status: {
    type: String,
    enum: ['PRESENT', 'NO_SHOW'],
    default: 'PRESENT'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Attendance', attendanceSchema);
