const Waitlist = require('../models/Waitlist');
const Booking = require('../models/Booking');
const Membership = require('../models/Membership');

const addToWaitlist = async (classId, memberId) => {
  // Check if already in waitlist
  const existing = await Waitlist.findOne({ classId, memberId, status: 'WAITING' });
  if (existing) {
    const error = new Error('Already on the waitlist for this class');
    error.statusCode = 409;
    error.errorCode = 'DUPLICATE_WAITLIST';
    throw error;
  }

  // Get max position
  const lastEntry = await Waitlist.findOne({ classId }).sort('-position');
  const position = lastEntry ? lastEntry.position + 1 : 1;

  const waitlistEntry = await Waitlist.create({
    classId,
    memberId,
    position,
    status: 'WAITING'
  });

  return waitlistEntry;
};

const hasActiveMembership = async (memberId) => {
  const memberships = await Membership.find({ memberId, status: 'ACTIVE' });
  return memberships.some(m => m.endDate >= new Date());
};

const promoteFromWaitlist = async (classId) => {
  // Find all waiting members ordered by position
  const waitlistEntries = await Waitlist.find({ classId, status: 'WAITING' }).sort('position');

  for (const entry of waitlistEntries) {
    const isActive = await hasActiveMembership(entry.memberId);
    if (isActive) {
      // Promote this user
      entry.status = 'PROMOTED';
      await entry.save();

      // Create booking
      await Booking.create({
        classId,
        memberId: entry.memberId,
        status: 'CONFIRMED'
      });

      return true; // Someone was promoted
    } else {
      // Membership expired. Skip them (mark as CANCELLED so we don't check them again)
      entry.status = 'CANCELLED';
      await entry.save();
    }
  }

  return false; // No one was promoted
};

const getWaitlist = async (classId) => {
  return await Waitlist.find({ classId }).sort('position').populate('memberId', 'name email');
};

const removeFromWaitlist = async (waitlistId, memberId) => {
  const entry = await Waitlist.findById(waitlistId);
  if (!entry) {
    const error = new Error('Waitlist entry not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }
  
  if (entry.memberId.toString() !== memberId.toString()) {
    const error = new Error('Not authorized to remove this waitlist entry');
    error.statusCode = 403;
    error.errorCode = 'FORBIDDEN';
    throw error;
  }

  entry.status = 'CANCELLED';
  await entry.save();
  return entry;
};

module.exports = {
  addToWaitlist,
  promoteFromWaitlist,
  getWaitlist,
  removeFromWaitlist
};
