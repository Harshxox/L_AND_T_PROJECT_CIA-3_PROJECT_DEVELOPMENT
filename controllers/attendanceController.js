const attendanceService = require('../services/attendanceService');
const { checkInSchema } = require('../validators/attendanceValidator');
const User = require('../models/User');
const Membership = require('../models/Membership');
const Attendance = require('../models/Attendance');

const checkIn = async (req, res, next) => {
  try {
    const { error } = checkInSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message, errorCode: 'VALIDATION_ERROR' });
    }

    const { memberId, type, classId } = req.body;
    
    const attendance = await attendanceService.checkIn(req.user, memberId, type, classId);
    res.status(201).json({ success: true, message: 'Check-in successful', data: { attendance } });
  } catch (err) { next(err); }
};

const scanQRCheckIn = async (req, res, next) => {
  try {
    const { qrToken } = req.body;
    if (!qrToken) {
      return res.status(400).json({ success: false, message: 'QR Token is required' });
    }

    const member = await User.findOne({ qrToken });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Invalid QR Pass token. Member not found.' });
    }

    // Check membership status
    const activeMembership = await Membership.findOne({
      memberId: member._id,
      status: 'ACTIVE',
      endDate: { $gte: new Date() }
    }).populate('planId', 'name');

    if (!activeMembership) {
      return res.status(403).json({
        success: false,
        message: `Entry Denied: ${member.name} has no active membership or it has expired.`,
        data: {
          member: {
            id: member._id,
            name: member.name,
            email: member.email,
            status: 'NO_ACTIVE_MEMBERSHIP'
          }
        }
      });
    }

    // Log attendance
    const attendance = await Attendance.create({
      memberId: member._id,
      type: 'GYM_VISIT',
      status: 'PRESENT',
      date: new Date()
    });

    res.status(200).json({
      success: true,
      message: `Access Granted! Welcome ${member.name}`,
      data: {
        member: {
          id: member._id,
          name: member.name,
          email: member.email,
          planName: activeMembership.planId?.name,
          expiresOn: activeMembership.endDate,
          ptSessionsBalance: member.ptSessionsBalance
        },
        attendance
      }
    });
  } catch (err) { next(err); }
};

const getMyAttendance = async (req, res, next) => {
  try {
    const records = await attendanceService.getMyAttendance(req.user._id);
    res.status(200).json({ success: true, message: 'Attendance retrieved', data: { records } });
  } catch (err) { next(err); }
};

const getMemberAttendance = async (req, res, next) => {
  try {
    const records = await attendanceService.getMemberAttendance(req.params.memberId);
    res.status(200).json({ success: true, message: 'Attendance retrieved', data: { records } });
  } catch (err) { next(err); }
};

const getClassAttendance = async (req, res, next) => {
  try {
    const records = await attendanceService.getClassAttendance(req.params.classId, req.user);
    res.status(200).json({ success: true, message: 'Attendance retrieved', data: { records } });
  } catch (err) { next(err); }
};

module.exports = {
  checkIn,
  scanQRCheckIn,
  getMyAttendance,
  getMemberAttendance,
  getClassAttendance
};

