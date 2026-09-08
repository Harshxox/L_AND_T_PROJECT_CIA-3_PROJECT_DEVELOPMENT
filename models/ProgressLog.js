const mongoose = require('mongoose');

const progressLogSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  weightKg: {
    type: Number,
    required: true
  },
  bodyFatPercentage: {
    type: Number
  },
  muscleMassKg: {
    type: Number
  },
  chestCm: {
    type: Number
  },
  waistCm: {
    type: Number
  },
  bicepsCm: {
    type: Number
  },
  benchPressPR: {
    type: Number
  },
  squatPR: {
    type: Number
  },
  deadliftPR: {
    type: Number
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProgressLog', progressLogSchema);
