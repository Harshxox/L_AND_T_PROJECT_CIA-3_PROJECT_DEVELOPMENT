const Booking = require('../models/Booking');
const Class = require('../models/Class');
const waitlistService = require('./waitlistService'); // Import waitlistService

// Helper to check if class has occurred
const hasClassStarted = (classItem) => {
  const classDateTime = new Date(classItem.date);
  const [hours, minutes] = classItem.startTime.split(':');
  classDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return classDateTime < new Date();
};

const bookClass = async (memberId, classId) => {
  // 1. Check class exists
  const classItem = await Class.findById(classId);
  if (!classItem) {
    const error = new Error('Class not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }

  // 2. Class not cancelled
  if (classItem.status === 'CANCELLED') {
    const error = new Error('Cannot book a cancelled class');
    error.statusCode = 400;
    error.errorCode = 'CLASS_CANCELLED';
    throw error;
  }

  // 3. Class hasn't already occurred
  if (hasClassStarted(classItem)) {
    const error = new Error('Cannot book a class that has already started or passed');
    error.statusCode = 400;
    error.errorCode = 'CLASS_STARTED';
    throw error;
  }

  // 4. Member not already booked
  const existingBooking = await Booking.findOne({
    classId,
    memberId,
    status: 'CONFIRMED'
  });
  
  if (existingBooking) {
    const error = new Error('You have already booked this class');
    error.statusCode = 409;
    error.errorCode = 'DUPLICATE_BOOKING';
    throw error;
  }

  // 5 & 6. Capacity check and Atomic Update
  const updatedClass = await Class.findOneAndUpdate(
    { _id: classId, bookedCount: { $lt: classItem.capacity } },
    { $inc: { bookedCount: 1 } },
    { new: true }
  );

  if (!updatedClass) {
    // CLASS IS FULL -> Add to waitlist
    const waitlistEntry = await waitlistService.addToWaitlist(classId, memberId);
    return { waitlisted: true, waitlistEntry };
  }

  // 7. Create booking
  const booking = await Booking.create({
    classId,
    memberId,
    status: 'CONFIRMED'
  });

  return { waitlisted: false, booking };
};

const cancelBooking = async (bookingId, memberId) => {
  const booking = await Booking.findById(bookingId).populate('classId');
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }

  if (booking.memberId.toString() !== memberId.toString()) {
    const error = new Error('Not authorized to cancel this booking');
    error.statusCode = 403;
    error.errorCode = 'FORBIDDEN';
    throw error;
  }

  if (booking.status !== 'CONFIRMED') {
    const error = new Error('Booking is already cancelled or completed');
    error.statusCode = 400;
    error.errorCode = 'INVALID_STATUS';
    throw error;
  }
  
  // Update booking status
  booking.status = 'CANCELLED';
  booking.cancelledAt = new Date();
  await booking.save();

  // Try to promote from waitlist
  const waitlistSuccess = await waitlistService.promoteFromWaitlist(booking.classId._id);
  
  if (!waitlistSuccess) {
    // Update class count only if no one was promoted
    await Class.findByIdAndUpdate(booking.classId._id, { $inc: { bookedCount: -1 } });
  }

  return booking;
};

const getMyBookings = async (memberId) => {
  return await Booking.find({ memberId }).populate('classId');
};

module.exports = {
  bookClass,
  cancelBooking,
  getMyBookings
};
