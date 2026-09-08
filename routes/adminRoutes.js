const express = require('express');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const User = require('../models/User');
const Membership = require('../models/Membership');
const Booking = require('../models/Booking');
const Trainer = require('../models/Trainer');

const router = express.Router();

router.use(protect);
router.use(requireRole('BRANCH ADMIN'));

// Get all users with assigned trainer populated
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().populate('assignedTrainerId', 'name specialization').select('-passwordHash');
    res.status(200).json({ success: true, data: { users } });
  } catch (err) { next(err); }
});

// Update user role
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-passwordHash');
    
    // If role changed to TRAINER, ensure Trainer doc exists
    if (req.body.role === 'TRAINER') {
      const existingTrainer = await Trainer.findOne({ userId: user._id });
      if (!existingTrainer) {
        await Trainer.create({
          userId: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          specialization: 'General Fitness',
          bio: 'Certified Gym Coach',
          hourlyRate: 45
        });
      }
    }
    
    res.status(200).json({ success: true, data: { user } });
  } catch (err) { next(err); }
});

// Assign Trainer to a Member
router.put('/users/:id/assign-trainer', async (req, res, next) => {
  try {
    const { trainerId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { assignedTrainerId: trainerId || null },
      { new: true }
    ).populate('assignedTrainerId', 'name specialization').select('-passwordHash');
    
    res.status(200).json({ success: true, message: 'Trainer assignment updated', data: { user } });
  } catch (err) { next(err); }
});

// Adjust PT session credits
router.put('/users/:id/pt-balance', async (req, res, next) => {
  try {
    const { ptSessionsBalance } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ptSessionsBalance: Number(ptSessionsBalance) },
      { new: true }
    ).select('-passwordHash');
    
    res.status(200).json({ success: true, message: 'PT balance updated', data: { user } });
  } catch (err) { next(err); }
});

// Get all memberships
router.get('/memberships', async (req, res, next) => {
  try {
    const memberships = await Membership.find().populate('memberId', 'name email').populate('planId', 'name');
    res.status(200).json({ success: true, data: { memberships } });
  } catch (err) { next(err); }
});

// Get all bookings
router.get('/bookings', async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate('memberId', 'name email').populate('classId', 'title date startTime');
    res.status(200).json({ success: true, data: { bookings } });
  } catch (err) { next(err); }
});

// Delete/Cancel booking
router.delete('/bookings/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    booking.status = 'CANCELLED';
    await booking.save();
    res.status(200).json({ success: true, message: 'Booking forcefully cancelled' });
  } catch (err) { next(err); }
});

// Force cancel membership
router.put('/memberships/:id/cancel', async (req, res, next) => {
  try {
    const membership = await Membership.findByIdAndUpdate(req.params.id, { status: 'CANCELLED', endDate: new Date() }, { new: true });
    res.status(200).json({ success: true, message: 'Membership forcefully cancelled', data: { membership } });
  } catch (err) { next(err); }
});

module.exports = router;

