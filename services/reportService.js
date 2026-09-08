const Attendance = require('../models/Attendance');
const Membership = require('../models/Membership');

const getAttendanceReport = async () => {
  const totalAttendance = await Attendance.countDocuments();
  
  const byDay = await Attendance.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  const byClass = await Attendance.aggregate([
    { $match: { type: 'CLASS' } },
    { $group: { _id: "$classId", count: { $sum: 1 } } },
    { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'classDetails' } },
    { $unwind: "$classDetails" },
    { $project: { _id: 0, classId: "$_id", className: "$classDetails.title", count: 1 } },
    { $sort: { count: -1 } }
  ]);

  const byMember = await Attendance.aggregate([
    { $group: { _id: "$memberId", count: { $sum: 1 } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'memberDetails' } },
    { $unwind: "$memberDetails" },
    { $project: { _id: 0, memberId: "$_id", memberName: "$memberDetails.name", email: "$memberDetails.email", count: 1 } },
    { $sort: { count: -1 } }
  ]);

  return { totalAttendance, byDay, byClass, byMember };
};

const getMembershipPlansReport = async () => {
  const totalPurchases = await Membership.countDocuments();
  
  const distribution = await Membership.aggregate([
    { $group: { _id: "$planId", count: { $sum: 1 } } },
    { $lookup: { from: 'membershipplans', localField: '_id', foreignField: '_id', as: 'planDetails' } },
    { $unwind: "$planDetails" },
    { $project: { _id: 0, planId: "$_id", planName: "$planDetails.name", count: 1 } },
    { $sort: { count: -1 } }
  ]);

  // The first element is the most popular due to the descending sort
  const mostPopularPlan = distribution.length > 0 ? distribution[0] : null;

  // Add percentage distribution
  const enrichedDistribution = distribution.map(d => ({
    ...d,
    percentage: totalPurchases > 0 ? parseFloat(((d.count / totalPurchases) * 100).toFixed(2)) : 0
  }));

  return { totalPurchases, mostPopularPlan, distribution: enrichedDistribution };
};

const getRenewalsReport = async () => {
  const totalMemberships = await Membership.countDocuments();
  const totalRenewed = await Membership.countDocuments({ renewalCount: { $gt: 0 } });
  
  // Define "eligible for renewal" as anyone who hasn't renewed yet or whose membership is near expiry.
  // For simplicity based on prompt "renewed / eligible-for-renewal ratio":
  // We'll define eligible as all memberships ever created (anyone CAN renew).
  const ratio = totalMemberships > 0 ? parseFloat((totalRenewed / totalMemberships).toFixed(2)) : 0;
  
  // For a more specific "eligible" count (e.g. active and within 30 days of expiry):
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const eligibleNearExpiry = await Membership.countDocuments({
    status: 'ACTIVE',
    endDate: { $lte: thirtyDaysFromNow }
  });

  return {
    totalMemberships,
    totalRenewed,
    renewedToTotalRatio: ratio,
    eligibleNearExpiry
  };
};

module.exports = {
  getAttendanceReport,
  getMembershipPlansReport,
  getRenewalsReport
};
