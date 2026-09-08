const reportService = require('../services/reportService');

const getAttendanceReport = async (req, res, next) => {
  try {
    const report = await reportService.getAttendanceReport();
    res.status(200).json({ success: true, message: 'Attendance report generated', data: report });
  } catch (err) { next(err); }
};

const getMembershipPlansReport = async (req, res, next) => {
  try {
    const report = await reportService.getMembershipPlansReport();
    res.status(200).json({ success: true, message: 'Membership plans report generated', data: report });
  } catch (err) { next(err); }
};

const getRenewalsReport = async (req, res, next) => {
  try {
    const report = await reportService.getRenewalsReport();
    res.status(200).json({ success: true, message: 'Renewals report generated', data: report });
  } catch (err) { next(err); }
};

module.exports = {
  getAttendanceReport,
  getMembershipPlansReport,
  getRenewalsReport
};
