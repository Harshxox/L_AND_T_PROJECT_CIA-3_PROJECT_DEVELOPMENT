const express = require('express');
const {
  checkIn,
  scanQRCheckIn,
  getMyAttendance,
  getMemberAttendance,
  getClassAttendance
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.use(protect);

// Members viewing their own attendance
router.get('/my', getMyAttendance);

// Authorized roles performing check-ins and viewing others
router.post('/checkin', requireRole(['BRANCH ADMIN', 'TRAINER']), checkIn);
router.post('/scan-qr', requireRole(['BRANCH ADMIN', 'TRAINER']), scanQRCheckIn);
router.get('/member/:memberId', requireRole(['BRANCH ADMIN', 'TRAINER']), getMemberAttendance);
router.get('/class/:classId', requireRole(['BRANCH ADMIN', 'TRAINER']), getClassAttendance);

module.exports = router;

