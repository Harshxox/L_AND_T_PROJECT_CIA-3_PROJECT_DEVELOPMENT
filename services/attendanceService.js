const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const Trainer = require('../models/Trainer');
const Membership = require('../models/Membership');
const User = require('../models/User');

const checkActiveMembership = async (memberId) => {
  const memberships = await Membership.find({ memberId, status: 'ACTIVE' });
  return memberships.some(m => m.endDate >= new Date());
};

const checkIn = async (userPerforming, memberId, type, classId = null) => {
  // 1. Check if member exists
  const member = await User.findById(memberId);
  if (!member) {
    const error = new Error('Member not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }

  // 2. Active membership check
  const isActive = await checkActiveMembership(memberId);
  if (!isActive) {
    const error = new Error('Member does not have an active membership');
    error.statusCode = 403;
    error.errorCode = 'EXPIRED_MEMBERSHIP';
    throw error;
  }

  let assignedTrainerId = null;

  if (type === 'CLASS') {
    if (!classId) {
      const error = new Error('classId is required for CLASS check-in');
      error.statusCode = 400;
      error.errorCode = 'VALIDATION_ERROR';
      throw error;
    }

    const classItem = await Class.findById(classId);
    if (!classItem) {
      const error = new Error('Class not found');
      error.statusCode = 404;
      error.errorCode = 'NOT_FOUND';
      throw error;
    }
    assignedTrainerId = classItem.trainerId;

    // 3. Authorization check (Trainer can only check in their own class)
    if (userPerforming.role === 'TRAINER') {
      const trainerProfile = await Trainer.findOne({ userId: userPerforming._id });
      if (!trainerProfile || trainerProfile._id.toString() !== classItem.trainerId.toString()) {
        const error = new Error('Trainers can only check in members for classes they teach');
        error.statusCode = 403;
        error.errorCode = 'FORBIDDEN';
        throw error;
      }
    }

    // 4. Duplicate check for same class
    // We check if an attendance record exists for this member and this class
    const existing = await Attendance.findOne({ memberId, classId, type: 'CLASS' });
    if (existing) {
      const error = new Error('Duplicate check-in for the same class is not allowed');
      error.statusCode = 409;
      error.errorCode = 'DUPLICATE_CHECKIN';
      throw error;
    }
  } else if (type === 'GYM_VISIT') {
    // 4. Duplicate check for GYM_VISIT on the same date (optional but good practice)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await Attendance.findOne({ 
      memberId, 
      type: 'GYM_VISIT',
      date: { $gte: today, $lt: tomorrow }
    });
    
    if (existing) {
      const error = new Error('Duplicate check-in for gym visit today');
      error.statusCode = 409;
      error.errorCode = 'DUPLICATE_CHECKIN';
      throw error;
    }
  }

  // 5. Record Attendance
  const attendance = await Attendance.create({
    memberId,
    classId: classId || undefined,
    trainerId: assignedTrainerId || undefined,
    type,
    date: new Date(),
    checkInTime: new Date(),
    status: 'PRESENT'
  });

  return attendance;
};

const getMyAttendance = async (memberId) => {
  return await Attendance.find({ memberId }).populate('classId trainerId');
};

const getMemberAttendance = async (memberId) => {
  return await Attendance.find({ memberId }).populate('classId trainerId');
};

const getClassAttendance = async (classId, userPerforming) => {
  // If TRAINER, ensure it's their class
  if (userPerforming.role === 'TRAINER') {
    const classItem = await Class.findById(classId);
    if (!classItem) {
      const error = new Error('Class not found');
      error.statusCode = 404;
      error.errorCode = 'NOT_FOUND';
      throw error;
    }
    const trainerProfile = await Trainer.findOne({ userId: userPerforming._id });
    if (!trainerProfile || trainerProfile._id.toString() !== classItem.trainerId.toString()) {
      const error = new Error('Trainers can only view attendance for classes they teach');
      error.statusCode = 403;
      error.errorCode = 'FORBIDDEN';
      throw error;
    }
  }

  return await Attendance.find({ classId }).populate('memberId', 'name email');
};

module.exports = {
  checkIn,
  getMyAttendance,
  getMemberAttendance,
  getClassAttendance
};
