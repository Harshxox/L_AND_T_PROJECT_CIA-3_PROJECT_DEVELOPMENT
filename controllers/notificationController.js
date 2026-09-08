const notificationService = require('../services/notificationService');

const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getMyNotifications(req.user._id);
    res.status(200).json({ success: true, message: 'Notifications retrieved', data: { notifications } });
  } catch (err) { next(err); }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: 'Notification marked as read', data: { notification } });
  } catch (err) { next(err); }
};

const triggerJob = async (req, res, next) => {
  try {
    await notificationService.runExpiryCheck();
    res.status(200).json({ success: true, message: 'Expiry check job executed manually', data: {} });
  } catch (err) { next(err); }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  triggerJob
};
