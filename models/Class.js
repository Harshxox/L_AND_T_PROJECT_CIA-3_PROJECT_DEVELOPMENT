const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true
  },
  instructorName: { type: String, default: 'Master Trainer' },
  branchId: { type: String, default: 'MAIN' },
  title: { type: String, required: true },
  description: { type: String },
  category: {
    type: String,
    enum: ['HIIT', 'YOGA', 'STRENGTH', 'SPINNING', 'CROSSFIT', 'BOXING', 'PILATES', 'GENERAL'],
    default: 'STRENGTH'
  },
  difficulty: {
    type: String,
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'],
    default: 'ALL_LEVELS'
  },
  room: {
    type: String,
    default: 'Studio 1'
  },
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // Format HH:mm
  endTime: { type: String, required: true },   // Format HH:mm
  capacity: {
    type: Number,
    required: true,
    min: [1, 'Capacity must be greater than 0']
  },
  bookedCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'CANCELLED', 'COMPLETED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Class', classSchema);

