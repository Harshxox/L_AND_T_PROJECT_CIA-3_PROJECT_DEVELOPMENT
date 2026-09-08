const waitlistService = require('../services/waitlistService');

const addToWaitlist = async (req, res, next) => {
  try {
    const waitlistEntry = await waitlistService.addToWaitlist(req.params.id, req.user._id);
    res.status(201).json({ success: true, message: 'Added to waitlist', data: { waitlistEntry } });
  } catch (err) { next(err); }
};

const getWaitlist = async (req, res, next) => {
  try {
    const waitlist = await waitlistService.getWaitlist(req.params.id);
    res.status(200).json({ success: true, message: 'Waitlist retrieved', data: { waitlist } });
  } catch (err) { next(err); }
};

const removeFromWaitlist = async (req, res, next) => {
  try {
    const waitlistEntry = await waitlistService.removeFromWaitlist(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: 'Removed from waitlist', data: { waitlistEntry } });
  } catch (err) { next(err); }
};

module.exports = {
  addToWaitlist,
  getWaitlist,
  removeFromWaitlist
};
