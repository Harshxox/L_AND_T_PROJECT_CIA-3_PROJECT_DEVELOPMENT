const trainerService = require('../services/trainerService');
const { createTrainerSchema, updateTrainerSchema } = require('../validators/trainerValidator');
const Trainer = require('../models/Trainer');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Booking = require('../models/Booking');
const { createNotification } = require('../services/notificationService');

const createTrainer = async (req, res, next) => {
  try {
    const { error } = createTrainerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message, errorCode: 'VALIDATION_ERROR' });
    }
    const trainer = await trainerService.createTrainer(req.body);
    res.status(201).json({ success: true, message: 'Trainer created', data: { trainer } });
  } catch (err) { next(err); }
};

const getTrainers = async (req, res, next) => {
  try {
    const trainers = await trainerService.getAllTrainers();
    res.status(200).json({ success: true, message: 'Trainers retrieved', data: { trainers } });
  } catch (err) { next(err); }
};

const getTrainer = async (req, res, next) => {
  try {
    const trainer = await trainerService.getTrainerById(req.params.id);
    res.status(200).json({ success: true, message: 'Trainer retrieved', data: { trainer } });
  } catch (err) { next(err); }
};

const updateTrainer = async (req, res, next) => {
  try {
    const { error } = updateTrainerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message, errorCode: 'VALIDATION_ERROR' });
    }
    const trainer = await trainerService.updateTrainer(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Trainer updated', data: { trainer } });
  } catch (err) { next(err); }
};

const activateTrainer = async (req, res, next) => {
  try {
    const trainer = await trainerService.changeStatus(req.params.id, 'ACTIVE');
    res.status(200).json({ success: true, message: 'Trainer activated', data: { trainer } });
  } catch (err) { next(err); }
};

const deactivateTrainer = async (req, res, next) => {
  try {
    const trainer = await trainerService.changeStatus(req.params.id, 'INACTIVE');
    res.status(200).json({ success: true, message: 'Trainer deactivated', data: { trainer } });
  } catch (err) { next(err); }
};

// Trainer portal endpoints
const getMyClients = async (req, res, next) => {
  try {
    const trainer = await Trainer.findOne({ userId: req.user.id });
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer profile not found' });
    }
    const clients = await User.find({ assignedTrainerId: trainer._id }).select('-passwordHash');
    res.status(200).json({ success: true, data: { clients, trainer } });
  } catch (err) { next(err); }
};

const logPTSession = async (req, res, next) => {
  try {
    const { memberId, notes } = req.body;
    const trainer = await Trainer.findOne({ userId: req.user.id });
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer profile not found' });
    }

    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (member.ptSessionsBalance <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Member has no PT session credits remaining. They need to purchase a PT package.'
      });
    }

    member.ptSessionsBalance -= 1;
    await member.save();

    // Record attendance
    const attendance = await Attendance.create({
      memberId: member._id,
      trainerId: trainer._id,
      type: 'GYM_VISIT',
      status: 'PRESENT',
      date: new Date()
    });

    // Record booking
    await Booking.create({
      trainerId: trainer._id,
      memberId: member._id,
      bookingType: 'PERSONAL_TRAINING',
      status: 'COMPLETED',
      notes: notes || '1-on-1 Personal Training completed'
    });

    await createNotification(
      member._id,
      `Your 1-on-1 PT session with Coach ${trainer.name} was completed. Remaining PT credits: ${member.ptSessionsBalance}`,
      'REMINDER'
    );

    res.status(200).json({
      success: true,
      message: 'PT session logged and credit deducted successfully',
      data: {
        remainingCredits: member.ptSessionsBalance,
        attendance
      }
    });
  } catch (err) { next(err); }
};

const getEarningsSummary = async (req, res, next) => {
  try {
    const trainer = await Trainer.findOne({ userId: req.user.id });
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer profile not found' });
    }

    const completedPTSessions = await Booking.countDocuments({
      trainerId: trainer._id,
      bookingType: 'PERSONAL_TRAINING',
      status: 'COMPLETED'
    });

    const rate = trainer.hourlyRate || 45;
    const totalEarnings = completedPTSessions * rate;

    res.status(200).json({
      success: true,
      data: {
        trainer,
        completedPTSessions,
        ratePerSession: rate,
        totalEarnings,
        rating: trainer.rating || 4.8,
        ratingCount: trainer.ratingCount || 1
      }
    });
  } catch (err) { next(err); }
};

module.exports = {
  createTrainer,
  getTrainers,
  getTrainer,
  updateTrainer,
  activateTrainer,
  deactivateTrainer,
  getMyClients,
  logPTSession,
  getEarningsSummary
};

