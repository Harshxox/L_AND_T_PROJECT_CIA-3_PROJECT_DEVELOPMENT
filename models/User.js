const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  passwordHash: {
    type: String,
    required: [true, 'Please add a password'],
    select: false // never return by default
  },
  role: {
    type: String,
    enum: ['MEMBER', 'TRAINER', 'BRANCH ADMIN'],
    default: 'MEMBER'
  },
  phone: {
    type: String,
    default: ''
  },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' }
  },
  medicalNotes: {
    type: String,
    default: 'No medical conditions noted.'
  },
  ptSessionsBalance: {
    type: Number,
    default: 0
  },
  qrToken: {
    type: String,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  assignedTrainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

