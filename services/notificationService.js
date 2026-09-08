const Notification = require('../models/Notification');
const Membership = require('../models/Membership');

const getMyNotifications = async (userId) => {
  return await Notification.find({ userId }).sort('-createdAt');
};

const markAsRead = async (id, userId) => {
  const notification = await Notification.findById(id);
  if (!notification) throw { statusCode: 404, message: 'Notification not found', errorCode: 'NOT_FOUND' };
  
  if (notification.userId.toString() !== userId.toString()) {
    throw { statusCode: 403, message: 'Not authorized', errorCode: 'FORBIDDEN' };
  }

  notification.read = true;
  await notification.save();
  return notification;
};

const runExpiryCheck = async () => {
  console.log('Running membership expiry check job...');
  
  // Find all ACTIVE memberships
  const activeMemberships = await Membership.find({ status: 'ACTIVE' });
  const today = new Date();
  
  for (const m of activeMemberships) {
    const timeDiff = m.endDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    let milestone = null;
    if (daysLeft === 7) milestone = '7_DAYS';
    else if (daysLeft === 3) milestone = '3_DAYS';
    else if (daysLeft === 1) milestone = '1_DAY';

    if (milestone) {
      // Check if notification already exists
      const exists = await Notification.findOne({
        userId: m.memberId,
        relatedMembershipId: m._id,
        milestone
      });

      if (!exists) {
        // Create notification
        await Notification.create({
          userId: m.memberId,
          type: 'EXPIRY_REMINDER',
          title: 'Membership Expiring Soon',
          message: `Your membership expires in ${daysLeft} days. Please renew to avoid interruption.`,
          relatedMembershipId: m._id,
          milestone
        });
        
        console.log(`Would send ${daysLeft}-day expiry SMS/Email to user ${m.memberId}`);
      }
    }
  }
};

const createNotification = async (userId, message, type = 'GENERAL', title = 'Notification') => {
  return await Notification.create({
    userId,
    type,
    title: type === 'ALERT' ? 'Payment Notification' : title,
    message
  });
};

module.exports = {
  getMyNotifications,
  markAsRead,
  runExpiryCheck,
  createNotification
};
