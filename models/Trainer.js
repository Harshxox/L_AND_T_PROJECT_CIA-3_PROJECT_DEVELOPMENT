const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  specialization: { type: String, required: true },
  experienceYears: { type: Number, default: 0 },
  bio: { type: String },
  branchId: { type: String },
  hourlyRate: { type: Number, default: 45 },
  rating: { type: Number, default: 4.8 },
  ratingCount: { type: Number, default: 1 },
  certifications: [{ type: String }],
  availableSlots: [{
    dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    startTime: String,
    endTime: String
  }],
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trainer', trainerSchema);

