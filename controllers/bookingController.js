const bookingService = require('../services/bookingService');

const bookClass = async (req, res, next) => {
  try {
    const booking = await bookingService.bookClass(req.user._id, req.params.id);
    res.status(201).json({ success: true, message: 'Class booked successfully', data: { booking } });
  } catch (err) { next(err); }
};

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getMyBookings(req.user._id);
    res.status(200).json({ success: true, message: 'Bookings retrieved', data: { bookings } });
  } catch (err) { next(err); }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: { booking } });
  } catch (err) { next(err); }
};

module.exports = {
  bookClass,
  getMyBookings,
  cancelBooking
};
