const Membership = require('../models/Membership');
const MembershipPlan = require('../models/MembershipPlan');

// Helper to check expiry and update DB if needed
const processExpiry = async (membership) => {
  if (!membership) return null;
  if (membership.status === 'ACTIVE' && membership.endDate < new Date()) {
    membership.status = 'EXPIRED';
    await membership.save();
  }
  return membership;
};

const purchaseMembership = async (memberId, planId) => {
  const plan = await MembershipPlan.findById(planId);
  if (!plan) {
    const error = new Error('Plan not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }

  if (plan.status !== 'ACTIVE') {
    const error = new Error('Cannot purchase an inactive plan');
    error.statusCode = 409;
    error.errorCode = 'INACTIVE_PLAN';
    throw error;
  }

  // Calculate dates
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + plan.durationMonths);

  const membership = await Membership.create({
    memberId,
    planId,
    startDate,
    endDate,
    status: 'ACTIVE'
  });

  return membership;
};

const renewMembership = async (membershipId, memberId) => {
  const membership = await Membership.findById(membershipId).populate('planId');
  if (!membership) {
    const error = new Error('Membership not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }

  if (membership.memberId.toString() !== memberId.toString()) {
    const error = new Error('Not authorized to renew this membership');
    error.statusCode = 403;
    error.errorCode = 'FORBIDDEN';
    throw error;
  }

  // Ensure it's evaluated for expiry before we renew
  await processExpiry(membership);

  const plan = membership.planId;
  if (!plan || plan.status !== 'ACTIVE') {
    const error = new Error('Cannot renew. Plan is no longer active or available.');
    error.statusCode = 409;
    error.errorCode = 'INACTIVE_PLAN';
    throw error;
  }

  // If currently active, extend from current endDate. If expired, start from today.
  let newStartDate;
  let newEndDate;

  if (membership.status === 'ACTIVE') {
    newStartDate = membership.startDate; // Keep original start
    newEndDate = new Date(membership.endDate);
    newEndDate.setMonth(newEndDate.getMonth() + plan.durationMonths);
  } else {
    // Expired or Cancelled -> Restarts today
    newStartDate = new Date();
    newEndDate = new Date();
    newEndDate.setMonth(newEndDate.getMonth() + plan.durationMonths);
  }

  membership.startDate = newStartDate;
  membership.endDate = newEndDate;
  membership.status = 'ACTIVE';
  membership.renewalCount += 1;
  
  await membership.save();
  return membership;
};

const getMyMemberships = async (memberId) => {
  const memberships = await Membership.find({ memberId }).populate('planId');
  // Process expiry check on read
  const processed = await Promise.all(memberships.map(m => processExpiry(m)));
  return processed;
};

const getMembershipById = async (id) => {
  const membership = await Membership.findById(id).populate('planId');
  if (!membership) {
    const error = new Error('Membership not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }
  return await processExpiry(membership);
};

module.exports = {
  purchaseMembership,
  renewMembership,
  getMyMemberships,
  getMembershipById
};
