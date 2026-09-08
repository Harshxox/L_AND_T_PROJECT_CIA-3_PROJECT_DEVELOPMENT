const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide equipment name']
  },
  serialNumber: {
    type: String,
    unique: true,
    required: [true, 'Please provide a serial number']
  },
  category: {
    type: String,
    enum: ['CARDIO', 'FREE_WEIGHTS', 'MACHINES', 'CROSSFIT', 'ACCESSORIES'],
    default: 'MACHINES'
  },
  locationRoom: {
    type: String,
    default: 'Main Floor'
  },
  status: {
    type: String,
    enum: ['OPERATIONAL', 'MAINTENANCE_REQUIRED', 'OUT_OF_ORDER'],
    default: 'OPERATIONAL'
  },
  lastServicedDate: {
    type: Date,
    default: Date.now
  },
  nextMaintenanceDate: {
    type: Date
  },
  notes: {
    type: String,
    default: 'Running smoothly.'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Equipment', equipmentSchema);
