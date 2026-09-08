const express = require('express');
const { getAttendanceReport, getMembershipPlansReport, getRenewalsReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();

router.use(protect);
router.use(requireRole('BRANCH ADMIN'));

router.get('/attendance', getAttendanceReport);
router.get('/membership-plans', getMembershipPlansReport);
router.get('/renewals', getRenewalsReport);

module.exports = router;
